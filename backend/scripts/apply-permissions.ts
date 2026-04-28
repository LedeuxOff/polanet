import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(resolve(__dirname, "../data/polanet.db"));

// Also try alternative paths
const alternativePaths = [
  resolve(__dirname, "../data/polanet.db"),
  resolve(__dirname, "../../data/polanet.db"),
  "data/polanet.db",
];

try {
  const sql = readFileSync(
    resolve(__dirname, "../drizzle/0003_add_permissions_table.sql"),
    "utf-8",
  );

  // Split by semicolon and execute each statement
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  let executed = 0;
  for (const statement of statements) {
    try {
      db.exec(statement);
      executed++;
    } catch (error) {
      console.log("Skipping statement:", statement.substring(0, 50), "...");
    }
  }

  console.log(`Successfully executed ${executed} statements`);

  // Verify tables were created
  const tables = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('permissions', 'role_permissions')",
    )
    .all() as Array<{ name: string }>;
  console.log(
    "Created tables:",
    tables.map((t) => t.name),
  );

  // Count permissions
  const count = db.prepare("SELECT COUNT(*) as count FROM permissions").get() as { count: number };
  console.log(`Total permissions inserted: ${count.count}`);
} catch (error) {
  console.error("Error:", error);
} finally {
  db.close();
}
