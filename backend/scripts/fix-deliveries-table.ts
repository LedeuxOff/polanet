import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../data/polanet.db");
console.log("Fixing deliveries table at:", dbPath);

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

console.log("=== Adding missing columns to deliveries table ===\n");

// Check existing columns
const tableInfo = db.prepare("PRAGMA table_info(deliveries)").all() as {
  cid: number;
  name: string;
  type: string;
}[];
console.log("Existing columns:");
tableInfo.forEach((col) => console.log(`  - ${col.name} (${col.type})`));

// Add notify_client if missing
const hasNotifyClient = tableInfo.some((col) => col.name === "notify_client");
if (!hasNotifyClient) {
  db.exec("ALTER TABLE deliveries ADD COLUMN notify_client INTEGER NOT NULL DEFAULT 0");
  console.log("\n✓ Added column: notify_client");
} else {
  console.log("\n✓ Column notify_client already exists");
}

// Add notify_driver if missing
const hasNotifyDriver = tableInfo.some((col) => col.name === "notify_driver");
if (!hasNotifyDriver) {
  db.exec("ALTER TABLE deliveries ADD COLUMN notify_driver INTEGER NOT NULL DEFAULT 0");
  console.log("✓ Added column: notify_driver");
} else {
  console.log("✓ Column notify_driver already exists");
}

// Verify
console.log("\n=== Updated columns ===");
const updatedInfo = db.prepare("PRAGMA table_info(deliveries)").all() as {
  cid: number;
  name: string;
  type: string;
}[];
updatedInfo.forEach((col) => console.log(`  - ${col.name} (${col.type})`));

console.log("\n=== Done! ===");
console.log("Please restart the backend server.");

db.close();
