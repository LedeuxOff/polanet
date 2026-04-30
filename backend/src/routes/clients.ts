import { Router } from "express";
import { db } from "../db/index.js";
import { clients } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import { createClientSchema, updateClientSchema } from "../middleware/validators.js";
import { eq } from "drizzle-orm";

const router = Router();

// Получить всех клиентов
router.get("/", authenticate, requirePermission("clients:list"), (req: AuthRequest, res) => {
  try {
    const allClients = db.select().from(clients).all();
    res.json(allClients);
  } catch (error) {
    console.error("Error getting clients:", error);
    res
      .status(500)
      .json({ error: "Ошибка сервера", details: error instanceof Error ? error.message : error });
  }
});

// Получить клиента по ID
router.get("/:id", authenticate, requirePermission("clients:detail"), (req: AuthRequest, res) => {
  try {
    const client = db
      .select()
      .from(clients)
      .where(eq(clients.id, Number(req.params.id)))
      .get();

    if (!client) {
      return res.status(404).json({ error: "Клиент не найден" });
    }

    res.json(client);
  } catch (error) {
    console.error("Error getting client:", error);
    res
      .status(500)
      .json({ error: "Ошибка сервера", details: error instanceof Error ? error.message : error });
  }
});

// Создать клиента
router.post("/", authenticate, requirePermission("clients:create"), (req: AuthRequest, res) => {
  try {
    const data = createClientSchema.parse(req.body);

    // Извлекаем payer и receiver, так как они не соответствуют схеме БД
    const { payer, receiver, ...clientData } = data;

    // Формируем объект для вставки
    const insertData: {
      type: "individual" | "legal";
      lastName?: string | null;
      firstName?: string | null;
      middleName?: string | null;
      organizationName?: string | null;
      phone?: string | null;
      email?: string | null;
      payerLastName?: string | null;
      payerFirstName?: string | null;
      payerMiddleName?: string | null;
      payerPhone?: string | null;
      receiverLastName?: string | null;
      receiverFirstName?: string | null;
      receiverMiddleName?: string | null;
      receiverPhone?: string | null;
    } = {
      type: clientData.type,
      lastName: clientData.lastName || null,
      firstName: clientData.firstName || null,
      middleName: clientData.middleName || null,
      organizationName: clientData.organizationName || null,
      phone: clientData.phone || null,
      email: clientData.email || null,
    };

    // Сохраняем payer и receiver в отдельные колонки (если есть)
    if (payer) {
      insertData.payerLastName = payer.lastName || null;
      insertData.payerFirstName = payer.firstName || null;
      insertData.payerMiddleName = payer.middleName || null;
      insertData.payerPhone = payer.phone || null;
    }

    if (receiver) {
      insertData.receiverLastName = receiver.lastName || null;
      insertData.receiverFirstName = receiver.firstName || null;
      insertData.receiverMiddleName = receiver.middleName || null;
      insertData.receiverPhone = receiver.phone || null;
    }

    const result = db
      .insert(clients)
      .values(insertData as any)
      .run();

    const newClient = db
      .select()
      .from(clients)
      .where(eq(clients.id, Number(result.lastInsertRowid)))
      .get();

    res.status(201).json(newClient);
  } catch (error) {
    console.error("Error creating client:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ error: "Ошибка валидации", details: error });
    }
    res
      .status(500)
      .json({ error: "Ошибка сервера", details: error instanceof Error ? error.message : error });
  }
});

// Обновить клиента
router.put("/:id", authenticate, requirePermission("clients:update"), (req: AuthRequest, res) => {
  try {
    const rawData = req.body;
    const clientId = Number(req.params.id);

    // Поддерживаем оба формата: плоский (payerLastName) и вложенный (payer: { lastName })
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    // Базовые поля
    if (rawData.type !== undefined) updateData.type = rawData.type;
    if (rawData.lastName !== undefined) updateData.lastName = rawData.lastName || null;
    if (rawData.firstName !== undefined) updateData.firstName = rawData.firstName || null;
    if (rawData.middleName !== undefined) updateData.middleName = rawData.middleName || null;
    if (rawData.organizationName !== undefined)
      updateData.organizationName = rawData.organizationName || null;
    if (rawData.phone !== undefined) updateData.phone = rawData.phone || null;
    if (rawData.email !== undefined) updateData.email = rawData.email || null;

    // Плательщик - плоский формат
    if (rawData.payerLastName !== undefined)
      updateData.payerLastName = rawData.payerLastName || null;
    if (rawData.payerFirstName !== undefined)
      updateData.payerFirstName = rawData.payerFirstName || null;
    if (rawData.payerMiddleName !== undefined)
      updateData.payerMiddleName = rawData.payerMiddleName || null;
    if (rawData.payerPhone !== undefined) updateData.payerPhone = rawData.payerPhone || null;

    // Приемщик - плоский формат
    if (rawData.receiverLastName !== undefined)
      updateData.receiverLastName = rawData.receiverLastName || null;
    if (rawData.receiverFirstName !== undefined)
      updateData.receiverFirstName = rawData.receiverFirstName || null;
    if (rawData.receiverMiddleName !== undefined)
      updateData.receiverMiddleName = rawData.receiverMiddleName || null;
    if (rawData.receiverPhone !== undefined)
      updateData.receiverPhone = rawData.receiverPhone || null;

    db.update(clients).set(updateData).where(eq(clients.id, clientId)).run();

    const updatedClient = db.select().from(clients).where(eq(clients.id, clientId)).get();

    res.json(updatedClient);
  } catch (error) {
    console.error("Error updating client:", error);
    res
      .status(500)
      .json({ error: "Ошибка сервера", details: error instanceof Error ? error.message : error });
  }
});

// Удалить клиента
router.delete(
  "/:id",
  authenticate,
  requirePermission("clients:delete"),
  (req: AuthRequest, res) => {
    try {
      const clientId = Number(req.params.id);

      db.delete(clients).where(eq(clients.id, clientId)).run();

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting client:", error);
      res
        .status(500)
        .json({ error: "Ошибка сервера", details: error instanceof Error ? error.message : error });
    }
  },
);

export default router;
