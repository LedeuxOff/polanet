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
  // Get all transport-cards permissions
  const transportCardsPermissions: Array<{ id: number; code: string }> = db
    .prepare("SELECT id, code FROM permissions WHERE module = 'transport-cards'")
    .all() as Array<{ id: number; code: string }>;

  if (transportCardsPermissions.length === 0) {
    console.log("No transport-cards permissions found in database!");
    process.exit(1);
  }

  console.log("Found transport-cards permissions:");
  transportCardsPermissions.forEach((p) => console.log(`  - ${p.code} (ID: ${p.id})`));

  // Get all roles
  const roles: Array<{ id: number; name: string; code: string }> = db
    .prepare("SELECT id, name, code FROM roles")
    .all() as Array<{ id: number; name: string; code: string }>;

  console.log("\nRoles:");
  roles.forEach((r) => console.log(`  - ${r.name} (${r.code}) ID: ${r.id}`));

  // Add permissions to roles that don't have them
  let addedCount = 0;
  for (const permission of transportCardsPermissions) {
    const rolesWithPermission: Array<{ role_id: number }> = db
      .prepare("SELECT role_id FROM role_permissions WHERE permission_id = ?")
      .all(permission.id) as Array<{ role_id: number }>;

    const roleIdsWithPermission = new Set(rolesWithPermission.map((r) => r.role_id));

    for (const role of roles) {
      if (!roleIdsWithPermission.has(role.id)) {
        db.prepare(
          "INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
        ).run(role.id, permission.id);
        console.log(`Added ${permission.code} to role: ${role.name}`);
        addedCount++;
      }
    }
  }

  console.log(`\nAdded ${addedCount} permission(s) to roles`);

  // Verify
  console.log("\nFinal role permissions for transport-cards module:");
  const finalCheck = db
    .prepare(
      "SELECT r.name, r.code, p.code as permission_code FROM role_permissions rp JOIN roles r ON rp.role_id = r.id JOIN permissions p ON rp.permission_id = p.id WHERE p.module = 'transport-cards' ORDER BY r.code, p.code",
    )
    .all() as Array<{ name: string; code: string; permission_code: string }>;

  finalCheck.forEach((row) => console.log(`  - ${row.name}: ${row.permission_code}`));
} catch (error) {
  console.error("Error:", error);
  process.exit(1);
} finally {
  db.close();
}
