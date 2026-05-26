import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../data/polanet.db");
console.log("Checking database at:", dbPath);

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

console.log("=== Checking permissions:manage ===\n");

// Check if permissions:manage exists
const existing = db
  .prepare("SELECT id FROM permissions WHERE code = 'permissions:manage'")
  .get() as { id: number } | undefined;

if (existing) {
  console.log(`Permission 'permissions:manage' already exists with ID: ${existing.id}`);
} else {
  db.prepare(
    "INSERT INTO permissions (module, code, name) VALUES ('roles', 'permissions:manage', 'Управление правами доступа')",
  ).run();
  console.log("✓ Inserted 'permissions:manage' permission");
}

const perm = db.prepare("SELECT id FROM permissions WHERE code = 'permissions:manage'").get() as {
  id: number;
};
const permId = perm.id;
console.log(`Permission ID: ${permId}\n`);

// Get all roles
const roles = db.prepare("SELECT id, code, name FROM roles ORDER BY id").all() as any[];
console.log(`Found ${roles.length} roles:`);
roles.forEach((r: any) => console.log(`  [${r.id}] ${r.code} - ${r.name}`));

// Assign permission to all roles
let assignedCount = 0;
for (const role of roles) {
  const existingRolePerm = db
    .prepare("SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ?")
    .get(role.id, permId) as { id: number } | undefined;

  if (existingRolePerm) {
    console.log(`  Role "${role.name}" already has permissions:manage`);
  } else {
    db.prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)").run(
      role.id,
      permId,
    );
    console.log(`  ✓ Assigned permissions:manage to "${role.name}"`);
    assignedCount++;
  }
}

console.log(`\n✓ Assigned permission to ${assignedCount} role(s).`);

// Verify
console.log("\n=== Verification ===");
const rolePerms = db
  .prepare(
    `
  SELECT r.id, r.code, r.name, p.code as perm_code 
  FROM role_permissions rp 
  JOIN roles r ON rp.role_id = r.id 
  JOIN permissions p ON rp.permission_id = p.id 
  WHERE p.code = 'permissions:manage'
`,
  )
  .all() as any[];

console.log(`Roles with 'permissions:manage': ${rolePerms.length}`);
rolePerms.forEach((rp: any) => console.log(`  [${rp.id}] ${rp.code} - ${rp.name}`));

console.log("\n=== Done! ===");
console.log("Please restart the backend server and try saving role permissions again.");

db.close();
