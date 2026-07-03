import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db/index.js";
import { users, roles, transportCards } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import { registerSchema, updateUserSchema } from "../middleware/validators.js";
import { eq, and, or, not, count, like } from "drizzle-orm";
import { generatePassword } from "../utils/password-generator.js";
import { sendPasswordNotification, sendTelegramMessage } from "../services/telegram-service.js";

const router = Router();

// Получить всех пользователей (с ролью) - с пагинацией и фильтрами
router.get("/", authenticate, requirePermission("users:list"), (req: AuthRequest, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = [1, 5, 10, 25, 50].includes(parseInt(req.query.limit as string))
      ? parseInt(req.query.limit as string)
      : 10;
    const offset = (page - 1) * limit;

    // Параметры фильтрации
    const search = req.query.search as string | undefined;
    const roleCode = req.query.roleCode as string | undefined;

    // Формируем условия WHERE
    // Поиск по полям - используем LIKE (SQLite case-insensitive для ASCII)
    // Объединяем через OR (любое поле может совпасть)
    const whereClause: Array<import("drizzle-orm").SQL<unknown>> = [];

    if (search) {
      const searchPattern = `%${search}%`;
      const searchOrCondition = or(
        like(users.lastName, searchPattern),
        like(users.firstName, searchPattern),
        like(users.middleName, searchPattern),
        like(users.email, searchPattern),
        like(users.phone, searchPattern),
      )!;
      whereClause.push(searchOrCondition);
    }

    // Фильтр по роли
    const isDeveloperFilter = roleCode === "DEVELOPER";
    if (roleCode && roleCode !== "all") {
      if (isDeveloperFilter) {
        // Для DEVELOPER фильтруем по code роли, а не по id
        whereClause.push(eq(roles.code, "DEVELOPER"));
      } else {
        whereClause.push(eq(users.roleId, parseInt(roleCode)));
      }
    }

    // Исключаем пользователей с ролью DEVELOPER (если не запрошен фильтр по разработчикам)
    const excludeDeveloperCondition = isDeveloperFilter
      ? eq(roles.code, "DEVELOPER")
      : not(eq(roles.code, "DEVELOPER"));
    let totalRecords = 0;
    if (whereClause.length > 0) {
      const totalResult = db
        .select({ count: count() })
        .from(users)
        .innerJoin(roles, eq(users.roleId, roles.id))
        .where(and(...whereClause, excludeDeveloperCondition))
        .get();
      totalRecords = totalResult?.count || 0;
    } else {
      const totalResult = db
        .select({ count: count() })
        .from(users)
        .innerJoin(roles, eq(users.roleId, roles.id))
        .where(excludeDeveloperCondition)
        .get();
      totalRecords = totalResult?.count || 0;
    }
    const totalPages = Math.ceil(totalRecords / limit);

    // Получаем пагинированные данные с фильтрами
    let paginatedUsers: any[];

    if (whereClause.length > 0) {
      paginatedUsers = db
        .select({
          id: users.id,
          lastName: users.lastName,
          firstName: users.firstName,
          middleName: users.middleName,
          birthDate: users.birthDate,
          email: users.email,
          phone: users.phone,
          roleId: users.roleId,
          roleCode: roles.code,
          roleName: roles.name,
          telegramChatId: users.telegramChatId,
          transportCardId: users.transportCardId,
          transportCard: transportCards.cardNumber,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .innerJoin(roles, eq(users.roleId, roles.id))
        .leftJoin(transportCards, eq(users.transportCardId, transportCards.id))
        .where(and(...whereClause, excludeDeveloperCondition))
        .limit(limit)
        .offset(offset)
        .all();
    } else {
      paginatedUsers = db
        .select({
          id: users.id,
          lastName: users.lastName,
          firstName: users.firstName,
          middleName: users.middleName,
          birthDate: users.birthDate,
          email: users.email,
          phone: users.phone,
          roleId: users.roleId,
          roleCode: roles.code,
          roleName: roles.name,
          telegramChatId: users.telegramChatId,
          transportCardId: users.transportCardId,
          transportCard: transportCards.cardNumber,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .innerJoin(roles, eq(users.roleId, roles.id))
        .leftJoin(transportCards, eq(users.transportCardId, transportCards.id))
        .where(excludeDeveloperCondition)
        .limit(limit)
        .offset(offset)
        .all();
    }

    res.json({
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Ошибка при получении пользователей:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Получить пользователя по ID
router.get("/:id", authenticate, requirePermission("users:detail"), (req: AuthRequest, res) => {
  try {
    const user = db
      .select({
        id: users.id,
        lastName: users.lastName,
        firstName: users.firstName,
        middleName: users.middleName,
        birthDate: users.birthDate,
        email: users.email,
        phone: users.phone,
        roleId: users.roleId,
        roleCode: roles.code,
        roleName: roles.name,
        telegramChatId: users.telegramChatId,
        transportCardId: users.transportCardId,
        transportCardNumber: transportCards.cardNumber,
        transportCardStatus: transportCards.status,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(transportCards, eq(users.transportCardId, transportCards.id))
      .where(eq(users.id, Number(req.params.id)))
      .get();

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Создать пользователя
router.post("/", authenticate, requirePermission("users:create"), async (req: AuthRequest, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = db.select().from(users).where(eq(users.email, data.email)).get();

    if (existingUser) {
      return res.status(409).json({ error: "Пользователь с таким email уже существует" });
    }

    // Генерируем пароль: если есть телефон - используем его, иначе - часть email до @
    let password: string;
    if (data.phone) {
      // Удаляем все нецифровые символы из телефона
      password = data.phone.replace(/\D/g, "");
    } else {
      // Берём часть email до символа @
      const emailPart = data.email.split("@")[0];
      password = emailPart;
    }
    const passwordHash = await bcrypt.hash(password, 10);

    const result = db
      .insert(users)
      .values({
        lastName: data.lastName,
        firstName: data.firstName,
        middleName: data.middleName,
        birthDate: data.birthDate,
        email: data.email,
        phone: data.phone,
        passwordHash,
        roleId: data.roleId,
        transportCardId: data.transportCardId || null,
      })
      .run();

    const newUser = db
      .select()
      .from(users)
      .where(eq(users.id, Number(result.lastInsertRowid)))
      .get();

    // Отправляем пароль через Telegram
    if (process.env.TELEGRAM_CHAT_ID) {
      try {
        await sendPasswordNotification(process.env.TELEGRAM_CHAT_ID, data.email, password);
      } catch (error) {
        console.error("Ошибка отправки Telegram уведомления:", error);
      }
    }

    res.status(201).json(newUser);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ error: "Ошибка валидации", details: error });
    }
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Обновить пользователя
router.put(
  "/:id",
  authenticate,
  requirePermission("users:update"),
  async (req: AuthRequest, res) => {
    try {
      const data = updateUserSchema.parse(req.body);
      const userId = Number(req.params.id);

      const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      db.update(users).set(updateData).where(eq(users.id, userId)).run();

      const updatedUser = db.select().from(users).where(eq(users.id, userId)).get();

      res.json(updatedUser);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Ошибка валидации", details: error });
      }
      res.status(500).json({ error: "Ошибка сервера" });
    }
  },
);

// Удалить пользователя
router.delete("/:id", authenticate, requirePermission("users:delete"), (req: AuthRequest, res) => {
  try {
    const userId = Number(req.params.id);

    // Нельзя удалить самого себя
    if (userId === req.userId) {
      return res.status(400).json({ error: "Нельзя удалить самого себя" });
    }

    db.delete(users).where(eq(users.id, userId)).run();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Выслать новый пароль
router.post(
  "/:id/send-password",
  authenticate,
  requirePermission("users:sendPassword"),
  async (req: AuthRequest, res) => {
    try {
      const userId = Number(req.params.id);

      // Получаем пользователя
      const user = db
        .select({
          id: users.id,
          telegramChatId: users.telegramChatId,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, userId))
        .get();

      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      // Проверяем, привязан ли Telegram
      if (!user.telegramChatId) {
        return res.status(400).json({ error: "У пользователя не привязан Telegram" });
      }

      // Генерируем 8-символьный пароль (буквы + цифры)
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let newPassword = "";
      for (let i = 0; i < 8; i++) {
        newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Обновляем пароль в БД
      db.update(users)
        .set({
          passwordHash,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(users.id, userId))
        .run();

      // Отправляем новый пароль на привязанный Telegram
      try {
        await sendTelegramMessage(
          user.telegramChatId,
          `🔑 <b>Ваш новый пароль для PolaNet</b>\n\n🔐 Пароль: <b>${newPassword}</b>\n\nПожалуйста, сохраните этот пароль в безопасном месте.`,
        );
      } catch (error) {
        console.error("Ошибка отправки уведомления об отвязке Telegram:", error);
      }

      res.json({ success: true, message: "Новый пароль сгенерирован и отправлен" });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Ошибка валидации", details: error });
      }
      res.status(500).json({ error: "Ошибка сервера" });
    }
  },
);

// Отвязать Telegram от пользователя
router.post(
  "/:id/unbind-telegram",
  authenticate,
  requirePermission("users:update"),
  async (req: AuthRequest, res) => {
    try {
      const userId = Number(req.params.id);

      // Получаем пользователя
      const user = db
        .select({
          id: users.id,
          lastName: users.lastName,
          firstName: users.firstName,
          telegramChatId: users.telegramChatId,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, userId))
        .get();

      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      // Если Telegram не привязан
      if (!user.telegramChatId) {
        return res.json({ success: true, message: "Telegram не привязан" });
      }

      const chatIdToNotify = user.telegramChatId;

      // Отвязываем Telegram
      db.update(users)
        .set({
          telegramChatId: null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(users.id, userId))
        .run();

      // Отправляем уведомление на последний привязанный chatId
      try {
        const userFio = `${user.lastName} ${user.firstName}`.trim();
        await sendTelegramMessage(
          chatIdToNotify,
          `⚠️ <b>Telegram отвязан от аккаунта PolaNet</b>\n\n👤 ${userFio}\n📧 ${user.email}\n\nВаш Telegram аккаунт отвязан. Если это были не вы, пожалуйста, свяжитесь с поддержкой.`,
        );
      } catch (error) {
        console.error("Ошибка отправки уведомления об отвязке Telegram:", error);
      }

      res.json({ success: true, message: "Telegram успешно отвязан" });
    } catch (error) {
      console.error("Ошибка при отвязке Telegram:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  },
);

export default router;
