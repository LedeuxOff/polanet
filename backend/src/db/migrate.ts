import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаем папку data если не существует
const dataDir = path.join(__dirname, "../../data");
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
// Отключаем проверку FK на время миграций
db.pragma("foreign_keys = OFF");

console.log("Применение миграций...\n");

// Путь к папке миграций (backend/drizzle)
const migrationsFolder = path.join(__dirname, "../../drizzle");
console.log(`Папка миграций: ${migrationsFolder}`);

// Проверяем существование папки
if (!fs.existsSync(migrationsFolder)) {
  console.error(`Ошибка: папка не найдена: ${migrationsFolder}`);
  db.close();
  process.exit(1);
}

// Читаем все SQL файлы миграций
const files = fs
  .readdirSync(migrationsFolder)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("Ошибка: не найдены SQL файлы в папке drizzle");
  db.close();
  process.exit(1);
}

console.log(`Найдено миграций: ${files.length}\n`);

for (const file of files) {
  console.log(`Применение: ${file}`);
  const sql = fs.readFileSync(path.join(migrationsFolder, file), "utf-8");
  try {
    db.exec(sql);
    console.log("  OK");
  } catch (error) {
    console.error(`  ERROR: ${error}`);
    db.close();
    process.exit(1);
  }
}

db.pragma("foreign_keys = ON");
db.close();
console.log("\nВсе миграции успешно применены!");
