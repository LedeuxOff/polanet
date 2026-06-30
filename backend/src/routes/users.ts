import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db/index.js";
import { users, roles } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import { registerSchema, updateUserSchema } from "../middleware/validators.js";
import { eq, and, or, count, like } from "drizzle-orm";
import { generatePassword } from "../utils/password-generator.js";
import { sendPasswordNotification } from "../services/telegram-service.js";

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
    if (roleCode && roleCode !== "all") {
      whereClause.push(eq(users.roleId, parseInt(roleCode)));
    }

    // Получаем общее количество пользователей с фильтрами
    let totalRecords = 0;
    if (whereClause.length > 0) {
      const totalResult = db
        .select({ count: count() })
        .from(users)
        .where(and(...whereClause))
        .get();
      totalRecords = totalResult?.count || 0;
    } else {
      const totalResult = db.select({ count: count() }).from(users).get();
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
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .leftJoin(roles, eq(users.roleId, roles.id))
        .where(and(...whereClause))
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
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .leftJoin(roles, eq(users.roleId, roles.id))
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
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
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

    // Генерируем случайный пароль
    const password = generatePassword(8);
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
      const user = db.select().from(users).where(eq(users.id, userId)).get();

      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      // Генерируем новый пароль
      const newPassword = generatePassword(8);
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Обновляем пароль в БД
      db.update(users)
        .set({
          passwordHash,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(users.id, userId))
        .run();

      // Отправляем новый пароль через Telegram
      if (process.env.TELEGRAM_CHAT_ID) {
        try {
          await sendPasswordNotification(process.env.TELEGRAM_CHAT_ID, user.email, newPassword);
        } catch (error) {
          console.error("Ошибка отправки Telegram уведомления:", error);
        }
      }

      res.json({ success: true, message: "Новый пароль сгенерирован" });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Ошибка валидации", details: error });
      }
      res.status(500).json({ error: "Ошибка сервера" });
    }
  },
);

export default router;
