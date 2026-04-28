import { createBackup } from "./backup.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфигурация
const AUTO_BACKUP_ENABLED = process.env.AUTO_BACKUP === "true";
const AUTO_BACKUP_INTERVAL_MS = parseInt(process.env.AUTO_BACKUP_INTERVAL || "3600000", 10); // 1 час по умолчанию
const AUTO_BACKUP_MAX_COUNT = parseInt(process.env.AUTO_BACKUP_MAX_COUNT || "24", 10); // Хранить последние 24 бэкапа

interface AutoBackupConfig {
  enabled: boolean;
  intervalMs: number;
  maxCount: number;
  backupDir: string;
}

const config: AutoBackupConfig = {
  enabled: AUTO_BACKUP_ENABLED,
  intervalMs: AUTO_BACKUP_INTERVAL_MS,
  maxCount: AUTO_BACKUP_MAX_COUNT,
  backupDir: path.join(__dirname, "../../data/backups"),
};

let backupInterval: NodeJS.Timeout | null = null;

/**
 * Удаляет старые бэкапы, оставляя только последние maxCount
 */
function cleanupOldBackups(): void {
  if (!fs.existsSync(config.backupDir)) {
    return;
  }

  const files = fs
    .readdirSync(config.backupDir)
    .filter((f) => f.startsWith("polanet-backup-") && f.endsWith(".db"))
    .map((filename) => ({
      filename,
      path: path.join(config.backupDir, filename),
      mtime: fs.statSync(path.join(config.backupDir, filename)).mtime,
    }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

  if (files.length > config.maxCount) {
    const toDelete = files.slice(config.maxCount);
    toDelete.forEach((file) => {
      try {
        fs.unlinkSync(file.path);
        console.log(`🗑️  Удалён старый бэкап: ${file.filename}`);
      } catch (error) {
        console.error(`❌ Ошибка удаления бэкапа ${file.filename}:`, error);
      }
    });
  }
}

/**
 * Выполняет бэкап с обработкой ошибок
 */
function performBackup(): void {
  try {
    const backupPath = createBackup();
    console.log(`[Auto-Backup] ${new Date().toISOString()} - Создан: ${path.basename(backupPath)}`);

    // Очищаем старые бэкапы
    cleanupOldBackups();
  } catch (error) {
    console.error("[Auto-Backup] Ошибка создания бэкапа:", error);
  }
}

/**
 * Запускает автоматическое резервное копирование
 */
export function startAutoBackup(): void {
  if (!config.enabled) {
    console.log("[Auto-Backup] Автоматическое резервное копирование отключено (AUTO_BACKUP=false)");
    return;
  }

  console.log(
    `[Auto-Backup] Запуск: интервал ${config.intervalMs / 60000} мин, макс. бэкапов: ${config.maxCount}`,
  );

  // Создаём первый бэкап сразу
  performBackup();

  // Запускаем интервал
  backupInterval = setInterval(() => {
    performBackup();
  }, config.intervalMs);

  // Обрабатываем корректное завершение
  process.on("SIGINT", stopAutoBackup);
  process.on("SIGTERM", stopAutoBackup);
}

/**
 * Останавливает автоматическое резервное копирование
 */
export function stopAutoBackup(): void {
  if (backupInterval) {
    clearInterval(backupInterval);
    backupInterval = null;
    console.log("[Auto-Backup] Остановлен");
  }
}

/**
 * Получает текущую конфигурацию
 */
export function getAutoBackupConfig(): AutoBackupConfig {
  return { ...config };
}

// Экспорт для использования в коде
export { cleanupOldBackups, performBackup };
