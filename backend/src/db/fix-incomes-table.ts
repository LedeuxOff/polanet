import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "../../data/polanet.db");
const db = new Database(dbPath);

console.log("Connected to database:", dbPath);

// Проверяем, существует ли таблица incomes
const tables = db
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='incomes'",
  )
  .all();

if (tables.length > 0) {
  console.log("Table 'incomes' already exists");
  db.close();
  process.exit(0);
}

// Создаём таблицу incomes
db.exec(`
  CREATE TABLE IF NOT EXISTS incomes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    income_type TEXT NOT NULL CHECK(income_type IN ('prepayment', 'delivery_payment')),
    payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'bank_transfer')),
    is_paid INTEGER NOT NULL DEFAULT 0 CHECK(is_paid IN (0, 1)),
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    payment_date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

console.log("Table 'incomes' created successfully");

// Проверяем, есть ли foreign key на deliveries
const columns = db.prepare("PRAGMA table_info(deliveries)").all();
const hasIncomeId = columns.some((col: any) => col.name === "income_id");

if (!hasIncomeId) {
  console.log("Adding income_id column to deliveries table...");
  db.exec(`
    ALTER TABLE deliveries ADD COLUMN income_id INTEGER REFERENCES incomes(id) ON DELETE SET NULL
  `);
  console.log("Column 'income_id' added to deliveries table");
} else {
  console.log("Column 'income_id' already exists in deliveries table");
}

db.close();
console.log("Database updated successfully");
