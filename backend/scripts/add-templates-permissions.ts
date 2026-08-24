import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "../data");
const dbPath = path.join(dataDir, "polanet.db");

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

console.log("Adding templates permissions...");

// Templates permissions
const templatesPermissions = [
  { module: "templates", code: "templates:list", name: "Просмотр списка шаблонов" },
  { module: "templates", code: "templates:create", name: "Создание шаблона" },
  { module: "templates", code: "templates:delete", name: "Удаление шаблона" },
];

const permissionIds: Record<string, number> = {};

for (const perm of templatesPermissions) {
  // Check if permission already exists
  const existing = db.prepare("SELECT id FROM permissions WHERE code = ?").get(perm.code) as
    | { id: number }
    | undefined;

  if (existing) {
    console.log(`Permission '${perm.code}' already exists with ID:`, existing.id);
    permissionIds[perm.code] = existing.id;
  } else {
    // Insert the permission
    db.exec(
      `INSERT INTO permissions (module, code, name) VALUES ('${perm.module}', '${perm.code}', '${perm.name}')`,
    );
    console.log(`Inserted '${perm.code}' permission`);
    const permData = db.prepare("SELECT id FROM permissions WHERE code = ?").get(perm.code) as {
      id: number;
    };
    permissionIds[perm.code] = permData.id;
  }
}

console.log("\nPermission IDs:", permissionIds);

// Get all roles
const roles = db.prepare("SELECT id, code, name FROM roles ORDER BY id").all() as {
  id: number;
  code: string;
  name: string;
}[];
console.log(`\nFound ${roles.length} roles:`);
for (const role of roles) {
  console.log(`  [${role.id}] ${role.code} - ${role.name}`);
}

// Assign permissions to all roles
let assignedCount = 0;
for (const code of Object.keys(permissionIds)) {
  const permId = permissionIds[code];
  for (const role of roles) {
    const existingRolePerm = db
      .prepare("SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ?")
      .get(role.id, permId) as { id: number } | undefined;

    if (existingRolePerm) {
      console.log(`Role "${role.name}" already has ${code} permission`);
    } else {
      db.prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)").run(
        role.id,
        permId,
      );
      console.log(`Assigned ${code} permission to role "${role.name}" (${role.code})`);
      assignedCount++;
    }
  }
}

console.log(
  `\nDone! Assigned ${Object.keys(permissionIds).length} permission(s) to ${assignedCount} role assignment(s).`,
);
console.log("Please restart the backend server and check the roles UI.");

db.close();
