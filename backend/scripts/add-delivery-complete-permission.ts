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

console.log("Adding deliveries:complete permission...");

// Check if permission already exists
const existing = db
  .prepare("SELECT id FROM permissions WHERE code = ?")
  .get("deliveries:complete") as { id: number } | undefined;

if (existing) {
  console.log("Permission 'deliveries:complete' already exists with ID:", existing.id);
} else {
  // Insert ONLY the missing permission
  db.exec(
    `INSERT INTO permissions (module, code, name) VALUES ('deliveries', 'deliveries:complete', 'Завершение доставки')`,
  );
  console.log("Inserted 'deliveries:complete' permission");
}

// Get the permission ID
const perm = db.prepare("SELECT id FROM permissions WHERE code = ?").get("deliveries:complete") as {
  id: number;
};
const permId = perm.id;
console.log(`Permission ID: ${permId}`);

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

// Assign permission to all roles
let assignedCount = 0;
for (const role of roles) {
  const existingRolePerm = db
    .prepare("SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ?")
    .get(role.id, permId) as { id: number } | undefined;

  if (existingRolePerm) {
    console.log(`Role "${role.name}" already has deliveries:complete permission`);
  } else {
    db.prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)").run(
      role.id,
      permId,
    );
    console.log(`Assigned deliveries:complete permission to role "${role.name}" (${role.code})`);
    assignedCount++;
  }
}

console.log(`\nDone! Assigned permission to ${assignedCount} role(s).`);
console.log("Please restart the backend server and check the roles UI.");

db.close();
