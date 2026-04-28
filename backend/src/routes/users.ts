import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db/index.js";
import { users, roles } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { registerSchema, updateUserSchema } from "../middleware/validators.js";
import { eq, and } from "drizzle-orm";
import { generatePassword } from "../utils/password-generator.js";
import { sendSms } from "../services/sms-service.js";

const router = Router();

// Получить всех пользователей (с ролью)
router.get("/", authenticate, (req: AuthRequest, res) => {
  try {
    const allUsers = db
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
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .all();

    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Получить пользователя по ID
router.get("/:id", authenticate, (req: AuthRequest, res) => {
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
router.post("/", authenticate, async (req: AuthRequest, res) => {
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

    // Отправляем SMS с паролем
    if (data.phone) {
      const message = `Вы получили доступ к административной панели polanet. Ваша почта: ${data.email}, ваш пароль: ${password}`;
      sendSms(data.phone, message).catch((error) => {
        console.error("Ошибка отправки SMS при создании пользователя:", error);
      });
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
router.put("/:id", authenticate, async (req: AuthRequest, res) => {
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
});

// Удалить пользователя
router.delete("/:id", authenticate, (req: AuthRequest, res) => {
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
router.post("/:id/send-password", authenticate, async (req: AuthRequest, res) => {
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

    // Отправляем SMS
    if (user.phone) {
      const message = `Ваш новый пароль для доступа к административной панели polanet: ${newPassword}`;
      const smsResult = await sendSms(user.phone, message);

      if (!smsResult.success) {
        return res.status(500).json({ error: "Ошибка отправки SMS", details: smsResult.errorMsg });
      }
    }

    res.json({ success: true, message: "Новый пароль сгенерирован и отправлен" });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ error: "Ошибка валидации", details: error });
    }
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
