import { Router } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq, isNotNull } from "drizzle-orm";
import { handleTelegramWebhook } from "../services/telegram-bot.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";

const router = Router();

// Webhook endpoint для Telegram (должен быть доступен публично)
router.post("/webhook", async (req, res) => {
  console.log("[Telegram Webhook] Получён запрос от Telegram");
  try {
    const result = await handleTelegramWebhook(req.body);
    console.log("[Telegram Webhook] Обработано, ответ:", JSON.stringify(result));
    res.json(result);
  } catch (error) {
    console.error("[Telegram Webhook] Ошибка обработки:", error);
    res.status(500).json({ error: "Ошибка обработки webhook" });
  }
});

// Привязка текущего пользователя к Telegram
router.post("/link", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const telegramChatId = req.body.chatId;

    if (!telegramChatId) {
      return res.status(400).json({ error: "Chat ID обязателен" });
    }

    // Проверяем, не занят ли chatId другим пользователем
    const existingUser = db
      .select()
      .from(users)
      .where(eq(users.telegramChatId, telegramChatId))
      .limit(1)
      .get();

    if (existingUser && existingUser.id !== userId) {
      return res.status(409).json({ error: "Этот Telegram уже привязан к другому аккаунту" });
    }

    // Привязываем chatId к пользователю
    db.update(users).set({ telegramChatId }).where(eq(users.id, userId)).run();

    res.json({ success: true, message: "Telegram успешно привязан" });
  } catch (error) {
    console.error("[Telegram Link] Ошибка:", error);
    res.status(500).json({ error: "Ошибка привязки Telegram" });
  }
});

// Отвязка Telegram от аккаунта
router.post("/unlink", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    db.update(users).set({ telegramChatId: null }).where(eq(users.id, userId)).run();

    res.json({ success: true, message: "Telegram отвязан" });
  } catch (error) {
    console.error("[Telegram Unlink] Ошибка:", error);
    res.status(500).json({ error: "Ошибка отвязки Telegram" });
  }
});

// Получить информацию о привязанном Telegram текущего пользователя
router.get("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const user = db
      .select({
        telegramChatId: users.telegramChatId,
      })
      .from(users)
      .where(eq(users.id, userId))
      .get();

    res.json({ telegramChatId: user?.telegramChatId || null });
  } catch (error) {
    console.error("[Telegram Me] Ошибка:", error);
    res.status(500).json({ error: "Ошибка получения информации" });
  }
});

// Получить всех пользователей с привязанным Telegram (только для администраторов)
router.get(
  "/users",
  authenticate,
  requirePermission("users:list"),
  async (req: AuthRequest, res) => {
    try {
      const userList = db
        .select({
          id: users.id,
          lastName: users.lastName,
          firstName: users.firstName,
          middleName: users.middleName,
          email: users.email,
          phone: users.phone,
          telegramChatId: users.telegramChatId,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(isNotNull(users.telegramChatId))
        .all();

      res.json(userList);
    } catch (error) {
      console.error("[Telegram Users] Ошибка:", error);
      res.status(500).json({ error: "Ошибка получения списка" });
    }
  },
);

// Ручная привязка Telegram к пользователю (для администраторов)
router.post(
  "/link-user/:id",
  authenticate,
  requirePermission("users:update"),
  async (req: AuthRequest, res) => {
    try {
      const targetUserId = Number(req.params.id);
      const telegramChatId = req.body.chatId;

      if (!telegramChatId) {
        return res.status(400).json({ error: "Chat ID обязателен" });
      }

      // Проверяем, не занят ли chatId другим пользователем
      const existingUser = db
        .select()
        .from(users)
        .where(eq(users.telegramChatId, telegramChatId))
        .limit(1)
        .get();

      if (existingUser && existingUser.id !== targetUserId) {
        return res.status(409).json({ error: "Этот Telegram уже привязан к другому аккаунту" });
      }

      // Получаем информацию о пользователе перед обновлением
      const targetUser = db.select().from(users).where(eq(users.id, targetUserId)).get();

      if (!targetUser) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      // Привязываем chatId к пользователю
      db.update(users).set({ telegramChatId }).where(eq(users.id, targetUserId)).run();

      res.json({
        success: true,
        message: `Telegram привязан к ${targetUser.firstName} ${targetUser.lastName}`,
      });
    } catch (error) {
      console.error("[Telegram Link User] Ошибка:", error);
      res.status(500).json({ error: "Ошибка привязки Telegram" });
    }
  },
);

// Отвязка Telegram от пользователя (для администраторов)
router.post(
  "/unlink-user/:id",
  authenticate,
  requirePermission("users:update"),
  async (req: AuthRequest, res) => {
    try {
      const targetUserId = Number(req.params.id);

      // Получаем информацию о пользователе перед обновлением
      const targetUser = db.select().from(users).where(eq(users.id, targetUserId)).get();

      if (!targetUser) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      // Отвязываем Telegram
      db.update(users).set({ telegramChatId: null }).where(eq(users.id, targetUserId)).run();

      res.json({
        success: true,
        message: `Telegram отвязан от ${targetUser.firstName} ${targetUser.lastName}`,
      });
    } catch (error) {
      console.error("[Telegram Unlink User] Ошибка:", error);
      res.status(500).json({ error: "Ошибка отвязки Telegram" });
    }
  },
);

// Получить информацию о webhook Telegram (публичный endpoint для проверки)
router.get("/webhook-info", async (_req, res) => {
  try {
    const { getTelegramWebhookInfo } = await import("../services/telegram-bot.js");
    const info = await getTelegramWebhookInfo();
    res.json(info || { ok: false, description: "Webhook not configured" });
  } catch (error) {
    console.error("[Telegram Webhook Info] Ошибка:", error);
    res.status(500).json({ error: "Ошибка получения информации о webhook" });
  }
});

export default router;
