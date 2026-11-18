import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Последняя миграция, выпущенная до появления таблицы _migrations */
const BASELINE_LAST_MIGRATION = "0033_work_directories.sql";

/**
 * Запускает миграции базы данных
 */
export async function runMigrations() {
  // Создаем папку data если не существует
  const dataDir = path.join(__dirname, "../../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log("Создана папка: data");
  }

  const dbPath = process.env.DATABASE_PATH || path.join(dataDir, "polanet.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  // Проверяем существование базы данных
  const dbExists = fs.existsSync(dbPath);
  if (dbExists) {
    console.log("База данных уже существует, применяем миграции");
  } else {
    console.log("Создается новая база данных");
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

  // Учёт применённых миграций: каждая выполняется только один раз.
  // Раньше все файлы выполнялись при каждом старте, из-за чего, например,
  // 0005 заново выдавала finances:view всем ролям после ручного снятия права.
  const hasMigrationsTable = !!db
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = '_migrations'")
    .get();
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  if (!hasMigrationsTable) {
    // Существующая БД уже прогоняла все файлы при прошлых стартах —
    // помечаем их применёнными, чтобы не выполнять повторно
    const isExistingDb = !!db
      .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'users'")
      .get();
    if (isExistingDb) {
      // Отмечаем только миграции, выпущенные до появления учёта (по 0033 включительно).
      // Более новые ещё могли не применяться на этой БД — они выполнятся ниже
      // (все они идемпотентны, т.к. раньше запускались при каждом старте)
      const mark = db.prepare("INSERT OR IGNORE INTO _migrations (name) VALUES (?)");
      const baseline = files.filter((f) => f <= BASELINE_LAST_MIGRATION);
      for (const file of baseline) mark.run(file);
      console.log(`Существующая БД: ${baseline.length} миграций отмечены как применённые`);
    }
  }

  const applied = new Set(
    (db.prepare("SELECT name FROM _migrations").all() as { name: string }[]).map((r) => r.name),
  );
  const markApplied = db.prepare("INSERT OR IGNORE INTO _migrations (name) VALUES (?)");

  for (const file of files) {
    if (applied.has(file)) continue;

    console.log(`Применение: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsFolder, file), "utf-8");
    try {
      db.exec(sql);
      console.log("  OK");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      // Игнорируем ошибки "already exists", "duplicate column" и подобные
      if (errorMessage.includes("already exists") || errorMessage.includes("duplicate column")) {
        console.log("  SKIPPED (уже существует)");
      } else {
        console.error(`  ERROR: ${errorMessage}`);
        db.close();
        process.exit(1);
      }
    }
    markApplied.run(file);
  }

  dedupeRolePermissions(db);
  fixDriverForeignKeys(db);

  db.pragma("foreign_keys = ON");
  db.close();
  console.log("\nВсе миграции успешно применены!");
}

// Запускаем миграции только при прямом выполнении файла
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations().catch((error) => {
    console.error("Ошибка при применении миграций:", error);
    process.exit(1);
  });
}

/**
 * Водители перенесены из таблицы drivers в users, но в старых БД
 * deliveries/expenses.driver_id всё ещё ссылаются на drivers(id).
 * Пересоздаём таблицы с FK на users(id) и переносим старые driver_id
 * на пользователей (сопоставление по телефону).
 */
function fixDriverForeignKeys(db: Database.Database) {
  for (const table of ["deliveries", "expenses"]) {
    const fks = db.prepare(`PRAGMA foreign_key_list(${table})`).all() as {
      table: string;
      from: string;
    }[];
    if (!fks.some((fk) => fk.from === "driver_id" && fk.table === "drivers")) continue;

    const row = db
      .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?")
      .get(table) as { sql: string };
    const tmp = `${table}__new`;
    const newSql = row.sql
      .replace(/CREATE TABLE\s+"?\w+"?/i, `CREATE TABLE ${tmp}`)
      .replace(/REFERENCES\s+"?drivers"?\s*\(\s*"?id"?\s*\)/gi, "REFERENCES users(id)");

    const hasDrivers = db
      .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'drivers'")
      .get();

    db.transaction(() => {
      db.exec(`DROP TABLE IF EXISTS ${tmp}`);
      db.exec(newSql);
      db.exec(`INSERT INTO ${tmp} SELECT * FROM ${table}`);
      if (hasDrivers) {
        // Переносим ссылки со старых водителей на пользователей с тем же телефоном
        db.exec(`
          UPDATE ${tmp} SET driver_id = (
            SELECT u.id FROM drivers d JOIN users u ON u.phone = d.phone
            WHERE d.id = ${tmp}.driver_id AND d.phone IS NOT NULL
            ORDER BY (SELECT r.code FROM roles r WHERE r.id = u.role_id) = 'DRIVER' DESC, u.id
            LIMIT 1
          )
          WHERE EXISTS (
              SELECT 1 FROM drivers d JOIN users u ON u.phone = d.phone
              WHERE d.id = ${tmp}.driver_id AND d.phone IS NOT NULL
            )
        `);
      }
      db.exec(`DROP TABLE ${table}`);
      db.exec(`ALTER TABLE ${tmp} RENAME TO ${table}`);
    })();
    console.log(`  FIX: ${table}.driver_id теперь ссылается на users(id)`);
  }
}

/**
 * Удаляет дубли в role_permissions (накопились из-за повторного запуска миграций)
 * и запрещает их появление уникальным индексом.
 */
function dedupeRolePermissions(db: Database.Database) {
  const result = db
    .prepare(
      `DELETE FROM role_permissions
       WHERE id NOT IN (SELECT MIN(id) FROM role_permissions GROUP BY role_id, permission_id)`,
    )
    .run();
  if (result.changes > 0) {
    console.log(`  FIX: удалено дублей прав ролей: ${result.changes}`);
  }
  db.exec(
    "CREATE UNIQUE INDEX IF NOT EXISTS role_permissions_role_permission_uq ON role_permissions (role_id, permission_id)",
  );
}
