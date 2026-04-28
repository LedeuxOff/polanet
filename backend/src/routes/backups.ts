import { Router } from "express";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { createBackup, restoreFromBackup, listBackups, deleteBackup } from "../db/backup.js";
import fs from "fs";
import path from "path";

const router = Router();

// Получение списка всех резервных копий
router.get("/", authenticate, (req: AuthRequest, res) => {
  try {
    const backups = listBackups();
    res.json(backups);
  } catch (error) {
    console.error("Error fetching backups:", error);
    res.status(500).json({ error: "Ошибка при получении списка бэкапов" });
  }
});

// Создание новой резервной копии
router.post("/", authenticate, (req: AuthRequest, res) => {
  try {
    const backupPath = createBackup();
    const backups = listBackups();
    const newBackup = backups.find((b) => b.path === backupPath);

    res.status(201).json({
      message: "Резервная копия успешно создана",
      backup: newBackup,
    });
  } catch (error) {
    console.error("Error creating backup:", error);
    res.status(500).json({ error: "Ошибка при создании резервной копии" });
  }
});

// Восстановление базы данных из резервной копии
router.post("/:filename/restore", authenticate, async (req: AuthRequest, res) => {
  try {
    const { filename } = req.params;
    const backupPath = path.join(process.cwd(), "data", "backups", filename);

    const success = restoreFromBackup(backupPath);

    if (success) {
      res.json({
        message: "База данных успешно восстановлена из резервной копии",
        backupPath,
      });
    }
  } catch (error) {
    console.error("Error restoring backup:", error);
    res.status(500).json({ error: "Ошибка при восстановлении из резервной копии" });
  }
});

// Удаление резервной копии
router.delete("/:filename", authenticate, async (req: AuthRequest, res) => {
  try {
    const { filename } = req.params;
    const backupPath = path.join(process.cwd(), "data", "backups", filename);

    deleteBackup(backupPath);

    res.json({
      message: "Резервная копия успешно удалена",
      filename,
    });
  } catch (error) {
    console.error("Error deleting backup:", error);
    res.status(500).json({ error: "Ошибка при удалении резервной копии" });
  }
});

export default router;
