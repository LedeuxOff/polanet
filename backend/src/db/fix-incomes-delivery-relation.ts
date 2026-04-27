import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "../../data/polanet.db");
const db = new Database(dbPath);

console.log("Connected to database:", dbPath);

// Проверяем, есть ли foreign key на incomes в deliveries
const deliveryColumns = db.prepare("PRAGMA table_info(deliveries)").all();
const hasIncomeId = deliveryColumns.some(
  (col: any) => col.name === "income_id",
);

if (!hasIncomeId) {
  console.log("Adding income_id column to deliveries table...");
  db.exec(`
    ALTER TABLE deliveries ADD COLUMN income_id INTEGER REFERENCES incomes(id) ON DELETE SET NULL
  `);
  console.log("Column 'income_id' added to deliveries table");
} else {
  console.log("Column 'income_id' already exists in deliveries table");
}

// Проверяем, есть ли delivery_id в incomes
const incomeColumns = db.prepare("PRAGMA table_info(incomes)").all();
const hasDeliveryId = incomeColumns.some(
  (col: any) => col.name === "delivery_id",
);

if (!hasDeliveryId) {
  console.log("Adding delivery_id column to incomes table...");
  db.exec(`
    ALTER TABLE incomes ADD COLUMN delivery_id INTEGER REFERENCES deliveries(id) ON DELETE SET NULL
  `);
  console.log("Column 'delivery_id' added to incomes table");
} else {
  console.log("Column 'delivery_id' already exists in incomes table");
}

db.close();
console.log("Database updated successfully");
