import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Создаем папку data если не существует
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log("Создана папка: data");
}

const dbPath = path.join(dataDir, "polanet.db");

// Удаляем старую базу если есть
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log("Удалена старая база данных");
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

console.log("Применение миграций...\n");

// Читаем все SQL файлы миграций
const migrationsFolder = path.join(__dirname, "../drizzle");
const files = fs
  .readdirSync(migrationsFolder)
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of files) {
  console.log(`Применение: ${file}`);
  const sql = fs.readFileSync(path.join(migrationsFolder, file), "utf-8");
  try {
    db.exec(sql);
    console.log(`  ✅ Успешно`);
  } catch (error) {
    console.error(`  ❌ Ошибка: ${error}`);
    db.close();
    process.exit(1);
  }
}

// Создаем таблицу миграций
db.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
  )
`);

// Записываем примененные миграции
for (const file of files) {
  try {
    db.prepare("INSERT OR IGNORE INTO _migrations (name) VALUES (?)").run(file);
  } catch {}
}

db.close();
console.log("\n✅ Все миграции успешно применены!");
