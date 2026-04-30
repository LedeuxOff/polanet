import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаем папку data если не существует
const dataDir = path.join(__dirname, "../../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log("Создана папка: data");
}

const sqlite = new Database(path.join(dataDir, "polanet.db"));
sqlite.pragma("journal_mode = wal");
const db = drizzle(sqlite);

console.log("Запуск миграций...");

try {
  migrate(db, { migrationsFolder: path.join(__dirname, "../../drizzle") });
  console.log("✅ Миграции успешно применены!");
} catch (error) {
  console.error("❌ Ошибка при применении миграций:", error);
  process.exit(1);
} finally {
  sqlite.close();
}
