import Database from "better-sqlite3";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PermissionRow {
  id: number;
  code: string;
  name: string;
  module?: string;
}

const dbPath = resolve(__dirname, "../data/polanet.db");

if (!existsSync(dbPath)) {
  console.error("Database file not found at:", dbPath);
  process.exit(1);
}

const db = new Database(dbPath);

try {
  // Check current permission
  const current: PermissionRow | undefined = db
    .prepare("SELECT id, code, name FROM permissions WHERE code = 'users:send-password'")
    .get() as PermissionRow | undefined;

  if (!current) {
    console.log("Permission 'users:send-password' not found. Checking for 'users:sendPassword'...");
    const existing: PermissionRow | undefined = db
      .prepare("SELECT id, code, name FROM permissions WHERE code = 'users:sendPassword'")
      .get() as PermissionRow | undefined;
    if (existing) {
      console.log("Permission 'users:sendPassword' already exists!");
      console.log("ID:", existing.id, "Code:", existing.code, "Name:", existing.name);
    } else {
      console.log("Permission does not exist. Need to create it.");
    }
  } else {
    console.log("Found permission:", current);

    // Update the permission code
    const result = db
      .prepare(
        "UPDATE permissions SET code = 'users:sendPassword' WHERE code = 'users:send-password'",
      )
      .run();

    console.log(`Updated ${result.changes} row(s)`);

    // Verify the update
    const updated: PermissionRow | undefined = db
      .prepare("SELECT id, code, name, module FROM permissions WHERE code = 'users:sendPassword'")
      .get() as PermissionRow | undefined;

    if (updated) {
      console.log("Successfully updated permission:");
      console.log("  ID:", updated.id);
      console.log("  Code:", updated.code);
      console.log("  Name:", updated.name);
      console.log("  Module:", updated.module);
    }
  }
} catch (error) {
  console.error("Error:", error);
  process.exit(1);
} finally {
  db.close();
}
