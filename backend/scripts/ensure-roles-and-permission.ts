import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "../../data");
const dbPath = path.join(dataDir, "polanet.db");

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

console.log("=== Ensuring roles and deliveries:complete permission ===\n");

// 1. Ensure deliveries:complete permission exists
const existingPerm = db
  .prepare("SELECT id FROM permissions WHERE code = ?")
  .get("deliveries:complete") as { id: number } | undefined;

if (existingPerm) {
  console.log(`✓ Permission 'deliveries:complete' already exists with ID: ${existingPerm.id}`);
} else {
  db.exec(
    `INSERT INTO permissions (module, code, name) VALUES ('deliveries', 'deliveries:complete', 'Завершение доставки')`,
  );
  console.log("✓ Inserted 'deliveries:complete' permission");
}

const perm = db.prepare("SELECT id FROM permissions WHERE code = ?").get("deliveries:complete") as {
  id: number;
};
const permId = perm.id;
console.log(`Permission ID: ${permId}\n`);

// 2. Ensure basic roles exist
const defaultRoles = [
  { code: "ADMIN", name: "Администратор" },
  { code: "USER", name: "Пользователь" },
  { code: "DEVELOPER", name: "Разработчик" },
];

console.log("Checking roles...");

for (const role of defaultRoles) {
  const existing = db.prepare("SELECT id FROM roles WHERE code = ?").get(role.code) as
    | { id: number }
    | undefined;

  if (existing) {
    console.log(`  ✓ Role '${role.code}' already exists with ID: ${existing.id}`);
  } else {
    db.prepare("INSERT INTO roles (code, name) VALUES (?, ?)").run(role.code, role.name);
    console.log(`  ✓ Created role '${role.code}' - ${role.name}`);
  }
}

// 3. Get all roles and assign permission
const roles = db.prepare("SELECT id, code, name FROM roles ORDER BY id").all() as {
  id: number;
  code: string;
  name: string;
}[];

console.log(`\nTotal roles in database: ${roles.length}`);

if (roles.length === 0) {
  console.log("\n⚠ WARNING: No roles found in database. Creating default roles...");
  for (const role of defaultRoles) {
    db.prepare("INSERT INTO roles (code, name) VALUES (?, ?)").run(role.code, role.name);
    console.log(`  ✓ Created role '${role.code}'`);
  }

  // Reload roles
  const newRoles = db.prepare("SELECT id, code, name FROM roles ORDER BY id").all() as {
    id: number;
    code: string;
    name: string;
  }[];

  // Assign permission to all roles
  let assignedCount = 0;
  for (const role of newRoles) {
    const existingRolePerm = db
      .prepare("SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ?")
      .get(role.id, permId) as { id: number } | undefined;

    if (existingRolePerm) {
      console.log(`  Role "${role.name}" already has deliveries:complete permission`);
    } else {
      db.prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)").run(
        role.id,
        permId,
      );
      console.log(`  ✓ Assigned deliveries:complete to role "${role.name}" (${role.code})`);
      assignedCount++;
    }
  }
  console.log(`\n✓ Assigned permission to ${assignedCount} role(s).`);
} else {
  let assignedCount = 0;
  for (const role of roles) {
    const existingRolePerm = db
      .prepare("SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ?")
      .get(role.id, permId) as { id: number } | undefined;

    if (existingRolePerm) {
      console.log(`  Role "${role.name}" already has deliveries:complete permission`);
    } else {
      db.prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)").run(
        role.id,
        permId,
      );
      console.log(`  ✓ Assigned deliveries:complete to role "${role.name}" (${role.code})`);
      assignedCount++;
    }
  }
  console.log(`\n✓ Assigned permission to ${assignedCount} role(s).`);
}

console.log("\n=== Done! ===");
console.log("Please restart the backend server and check:");
console.log(
  "1. Go to /roles/{roleId} - you should see 'Завершение доставки' in the Deliveries section",
);
console.log("2. Try completing a delivery - it should work now");

db.close();
