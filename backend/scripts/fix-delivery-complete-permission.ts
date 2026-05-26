import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backend uses this path relative to backend/ directory
const dbPath = path.join(__dirname, "../data/polanet.db");
console.log("Fixing permission in database at:", dbPath);

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

console.log("=== Adding deliveries:complete permission ===\n");

// 1. Check if permission exists
const existing = db
  .prepare("SELECT id FROM permissions WHERE code = 'deliveries:complete'")
  .get() as { id: number } | undefined;

if (existing) {
  console.log(`Permission 'deliveries:complete' already exists with ID: ${existing.id}`);
} else {
  // Insert the missing permission
  db.prepare(
    "INSERT INTO permissions (module, code, name) VALUES ('deliveries', 'deliveries:complete', 'Завершение доставки')",
  ).run();
  console.log("✓ Inserted 'deliveries:complete' permission");
}

// Get the permission ID
const perm = db.prepare("SELECT id FROM permissions WHERE code = 'deliveries:complete'").get() as {
  id: number;
};
const permId = perm.id;
console.log(`Permission ID: ${permId}`);

// 2. Get all roles
const roles = db.prepare("SELECT id, code, name FROM roles ORDER BY id").all() as any[];
console.log(`\nFound ${roles.length} roles:`);
roles.forEach((r: any) => console.log(`  [${r.id}] ${r.code} - ${r.name}`));

// 3. Assign permission to all roles
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

// Verify
console.log("\n=== Verification ===");
const rolePerms = db
  .prepare(
    `
  SELECT r.id, r.code, r.name, p.code as perm_code 
  FROM role_permissions rp 
  JOIN roles r ON rp.role_id = r.id 
  JOIN permissions p ON rp.permission_id = p.id 
  WHERE p.code = 'deliveries:complete'
`,
  )
  .all() as any[];

console.log(`Roles with 'deliveries:complete': ${rolePerms.length}`);
rolePerms.forEach((rp: any) => console.log(`  [${rp.id}] ${rp.code} - ${rp.name}`));

console.log("\n=== Done! ===");
console.log("Please restart the backend server and check:");
console.log(
  "1. Go to /roles/{roleId} - you should see 'Завершение доставки' in the Deliveries section",
);
console.log("2. Try completing a delivery - it should work now");

db.close();
