import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backend uses this path relative to backend/ directory
const dbPath = path.join(__dirname, "../data/polanet.db");
console.log("Checking database at:", dbPath);

const db = new Database(dbPath);

console.log("=== Checking backend database state ===\n");

// Check all permissions
console.log("All permissions:");
const permissions = db.prepare("SELECT * FROM permissions ORDER BY module, code").all() as any[];
permissions.forEach((p: any) => console.log(`  [${p.id}] ${p.module}.${p.code} = ${p.name}`));

// Check deliveries:complete specifically
console.log("\nChecking deliveries:complete:");
const perm = db
  .prepare("SELECT * FROM permissions WHERE code = 'deliveries:complete'")
  .get() as any;
console.log(perm ? JSON.stringify(perm) : "NOT FOUND");

// Check all roles
console.log("\nAll roles:");
const roles = db.prepare("SELECT * FROM roles ORDER BY id").all() as any[];
roles.forEach((r: any) => console.log(`  [${r.id}] ${r.code} = ${r.name}`));

// Check role_permissions for deliveries:complete
if (perm) {
  console.log(`\nRoles with 'deliveries:complete' (perm_id = ${perm.id}):`);
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

  if (rolePerms.length === 0) {
    console.log("  NONE!");
  } else {
    rolePerms.forEach((rp: any) => console.log(`  [${rp.id}] ${rp.code} - ${rp.name}`));
  }
}

// Check total role_permissions count
const totalRP = db.prepare("SELECT COUNT(*) as count FROM role_permissions").get() as {
  count: number;
};
console.log(`\nTotal role_permissions: ${totalRP.count}`);

db.close();
