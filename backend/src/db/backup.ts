import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "../../data/polanet.db");
const BACKUP_DIR = path.join(__dirname, "../../data/backups");

/**
 * Создаёт резерную копию базы данных
 * @param customPath - опциональный путь для сохранения бэкапа
 * @returns путь к созданному файлу
 */
export function createBackup(customPath?: string): string {
  // Проверяем существование БД
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`База данных не найдена: ${DB_PATH}`);
  }

  // Создаём директорию для бэкапов если не существует
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // Формируем имя файла с таймстемпом
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFilename = customPath || `polanet-backup-${timestamp}.db`;
  const backupPath = customPath ? path.resolve(customPath) : path.join(BACKUP_DIR, backupFilename);

  // Создаём директорию для кастомного пути если нужно
  const backupDir = path.dirname(backupPath);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Открываем базу данных
  const db = new Database(DB_PATH);

  try {
    // Используем VACUUM INTO для создания копии
    // Это атомарная операция в SQLite
    db.prepare("VACUUM INTO ?").run(backupPath);

    console.log(`✅ Резервная копия создана: ${backupPath}`);
    return backupPath;
  } finally {
    db.close();
  }
}

/**
 * Восстанавливает базу данных из резервной копии
 * @param backupPath - путь к файлу бэкапа
 * @returns true если восстановление успешно
 */
export function restoreFromBackup(backupPath: string): boolean {
  // Проверяем существование бэкапа
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Файл резервной копии не найден: ${backupPath}`);
  }

  // Проверяем что это валидный SQLite файл
  const buffer = Buffer.alloc(16);
  const fd = fs.openSync(backupPath, "r");
  fs.readSync(fd, buffer, 0, 16, 0);
  fs.closeSync(fd);

  const header = buffer.toString("utf-8", 0, 15);
  if (!header.startsWith("SQLite format 3")) {
    throw new Error("Файл не является валидной базой данных SQLite");
  }

  try {
    // Создаём бэкап перед восстановлением (автосохранение)
    if (fs.existsSync(DB_PATH)) {
      const currentBackup = createBackup();
      console.log(`⚠️  Текущее состояние сохранено: ${currentBackup}`);
    }

    // Копируем бэкап на место основной БД
    fs.copyFileSync(backupPath, DB_PATH);

    console.log(`✅ База данных восстановлена из: ${backupPath}`);
    return true;
  } catch (error) {
    console.error("❌ Ошибка восстановления:", error);
    throw error;
  }
}

/**
 * Получает список всех резервных копий
 */
export function listBackups(): Array<{
  filename: string;
  path: string;
  size: number;
  createdAt: Date;
}> {
  if (!fs.existsSync(BACKUP_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BACKUP_DIR);
  const backupFiles = files
    .filter((f) => f.endsWith(".db") && f.startsWith("polanet-backup-"))
    .map((filename) => {
      const filePath = path.join(BACKUP_DIR, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        path: filePath,
        size: stats.size,
        createdAt: stats.birthtime,
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return backupFiles;
}

/**
 * Удаляет резервную копию
 * @param backupPath - путь к файлу бэкапа
 */
export function deleteBackup(backupPath: string): void {
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Файл не найден: ${backupPath}`);
  }

  fs.unlinkSync(backupPath);
  console.log(`🗑️  Резервная копия удалена: ${backupPath}`);
}

/**
 * Форматирует размер файла в читаемый вид
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// CLI режим
if (process.argv[1] === path.resolve(__filename)) {
  const command = process.argv[2];

  switch (command) {
    case "create":
      const customPath = process.argv[3];
      try {
        const backupPath = createBackup(customPath);
        console.log(`Путь: ${backupPath}`);
      } catch (error) {
        console.error("Ошибка:", error);
        process.exit(1);
      }
      break;

    case "restore":
      const restorePath = process.argv[3];
      if (!restorePath) {
        console.error("Укажите путь к файлу бэкапа");
        process.exit(1);
      }
      try {
        restoreFromBackup(restorePath);
      } catch (error) {
        console.error("Ошибка:", error);
        process.exit(1);
      }
      break;

    case "list":
      const backups = listBackups();
      if (backups.length === 0) {
        console.log("Нет доступных резервных копий");
      } else {
        console.log("\n📦 Резервные копии:\n");
        backups.forEach((backup, index) => {
          console.log(
            `${index + 1}. ${backup.filename} (${formatFileSize(backup.size)}) - ${backup.createdAt.toLocaleString("ru-RU")}`,
          );
        });
        console.log(`\nВсего: ${backups.length} копий`);
      }
      break;

    case "delete":
      const deletePath = process.argv[3];
      if (!deletePath) {
        console.error("Укажите путь к файлу бэкапа");
        process.exit(1);
      }
      try {
        deleteBackup(deletePath);
      } catch (error) {
        console.error("Ошибка:", error);
        process.exit(1);
      }
      break;

    default:
      console.log(`
📦 Polanet Database Backup Tool

Использование:
  tsx src/db/backup.ts create [путь]     Создать резервную копию
  tsx src/db/backup.ts restore <путь>     Восстановить из бэкапа
  tsx src/db/backup.ts list               Список всех бэкапов
  tsx src/db/backup.ts delete <путь>      Удалить бэкап

Примеры:
  tsx src/db/backup.ts create
  tsx src/db/backup.ts create /tmp/my-backup.db
  tsx src/db/backup.ts restore data/backups/polanet-backup-2024-01-01.db
  tsx src/db/backup.ts list
      `);
  }
}
