import Database from "better-sqlite3";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = resolve(__dirname, "../data/polanet.db");

if (!existsSync(dbPath)) {
  console.error("Database file not found at:", dbPath);
  process.exit(1);
}

const db = new Database(dbPath);

try {
  // Get the permission ID for users:sendPassword
  const permission: { id: number; code: string } | undefined = db
    .prepare("SELECT id, code FROM permissions WHERE code = 'users:sendPassword'")
    .get() as { id: number; code: string } | undefined;

  if (!permission) {
    console.log("Permission 'users:sendPassword' not found!");
    process.exit(1);
  }

  console.log("Found permission:", permission);

  // Get all roles
  const roles: Array<{ id: number; name: string; code: string }> = db
    .prepare("SELECT id, name, code FROM roles")
    .all() as Array<{ id: number; name: string; code: string }>;

  console.log("\nRoles:");
  roles.forEach((r) => console.log(`  - ${r.name} (${r.code}) ID: ${r.id}`));

  // Check which roles already have this permission
  const rolesWithPermission: Array<{ role_id: number }> = db
    .prepare("SELECT role_id FROM role_permissions WHERE permission_id = ?")
    .all(permission.id) as Array<{ role_id: number }>;

  const roleIdsWithPermission = new Set(rolesWithPermission.map((r) => r.role_id));

  console.log("\nRoles that already have 'users:sendPassword':", Array.from(roleIdsWithPermission));

  // Add permission to roles that don't have it (admin and all others)
  let addedCount = 0;
  for (const role of roles) {
    if (!roleIdsWithPermission.has(role.id)) {
      db.prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)").run(
        role.id,
        permission.id,
      );
      console.log(`Added permission to role: ${role.name}`);
      addedCount++;
    }
  }

  console.log(`\nAdded permission to ${addedCount} role(s)`);

  // Verify
  const finalCheck = db
    .prepare(
      "SELECT r.name, r.code FROM role_permissions rp JOIN roles r ON rp.role_id = r.id WHERE rp.permission_id = ?",
    )
    .all(permission.id) as Array<{ name: string; code: string }>;

  console.log("\nAll roles with 'users:sendPassword' permission:");
  finalCheck.forEach((r) => console.log(`  - ${r.name} (${r.code})`));
} catch (error) {
  console.error("Error:", error);
  process.exit(1);
} finally {
  db.close();
}
