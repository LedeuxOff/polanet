import { Router } from "express";
import { db } from "../db/index.js";
import { templates, clients } from "../db/schema.js";
import { sql } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import { createOrderSchema } from "../middleware/validators.js";
import { eq, desc, and, eq as eqFn } from "drizzle-orm";

const router = Router();

// Получить все шаблоны текущего пользователя
router.get(
  "/",
  authenticate,
  requirePermission("templates:list"),
  async (req: AuthRequest, res) => {
    try {
      const userTemplates = await db
        .select({
          id: templates.id,
          type: templates.type,
          address: templates.address,
          payerLastName: templates.payerLastName,
          payerFirstName: templates.payerFirstName,
          payerMiddleName: templates.payerMiddleName,
          payerPhone: templates.payerPhone,
          receiverLastName: templates.receiverLastName,
          receiverFirstName: templates.receiverFirstName,
          receiverMiddleName: templates.receiverMiddleName,
          receiverPhone: templates.receiverPhone,
          date: templates.date,
          volume: templates.volume,
          hasPass: templates.hasPass,
          addressComment: templates.addressComment,
          clientId: templates.clientId,
          createdById: templates.createdById,
          createdAt: templates.createdAt,
          updatedAt: templates.updatedAt,
          clientName: sql<
            string | null
          >`CASE WHEN ${clients.id} IS NOT NULL THEN CASE WHEN ${clients.type} = 'legal' THEN ${clients.organizationName} ELSE ${clients.lastName} || ' ' || ${clients.firstName} || ' ' || ${clients.middleName} END ELSE NULL END`,
        })
        .from(templates)
        .where(eqFn(templates.createdById, req.userId!))
        .leftJoin(clients, eq(templates.clientId, clients.id))
        .orderBy(desc(templates.createdAt));

      res.json(userTemplates);
    } catch (error) {
      console.error("Error getting templates:", error);
      res.status(500).json({
        error: "Ошибка сервера",
        details: error instanceof Error ? error.message : error,
      });
    }
  },
);

// Получить шаблон по ID (только если он принадлежит текущему пользователю)
router.get(
  "/:id",
  authenticate,
  requirePermission("templates:list"),
  async (req: AuthRequest, res) => {
    try {
      const templateId = Number(req.params.id);

      const template = await db
        .select()
        .from(templates)
        .where(and(eq(templates.id, templateId), eqFn(templates.createdById, req.userId!)))
        .limit(1);

      if (!template || template.length === 0) {
        return res.status(404).json({ error: "Шаблон не найден" });
      }

      res.json(template[0]);
    } catch (error) {
      console.error("Error getting template:", error);
      res.status(500).json({
        error: "Ошибка сервера",
        details: error instanceof Error ? error.message : error,
      });
    }
  },
);

// Сохранить шаблон из заявки
router.post(
  "/from-order/:orderId",
  authenticate,
  requirePermission("templates:create"),
  async (req: AuthRequest, res) => {
    try {
      const orderId = Number(req.params.orderId);
      const userId = req.userId!;

      // Получаем заявку
      const orderData = await db.select().from(templates).where(eq(templates.id, orderId)).limit(1);

      // Валидируем данные из заявки
      const validatedData = createOrderSchema.parse(req.body);

      const now = new Date().toISOString();

      const result = await db
        .insert(templates)
        .values({
          type: validatedData.type,
          address: validatedData.address,
          payerLastName: validatedData.payerLastName,
          payerFirstName: validatedData.payerFirstName,
          payerMiddleName: validatedData.payerMiddleName || null,
          payerPhone: validatedData.payerPhone || null,
          receiverLastName: validatedData.receiverLastName,
          receiverFirstName: validatedData.receiverFirstName,
          receiverMiddleName: validatedData.receiverMiddleName || null,
          receiverPhone: validatedData.receiverPhone || null,
          date: validatedData.date,
          volume: validatedData.volume || null,
          hasPass: validatedData.hasPass,
          addressComment: validatedData.addressComment || null,
          clientId: validatedData.clientId || null,
          createdById: userId,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      const newTemplate = await db
        .select()
        .from(templates)
        .where(eq(templates.id, Number(result.lastInsertRowid)))
        .limit(1);

      res.status(201).json(newTemplate[0]);
    } catch (error) {
      console.error("Error creating template from order:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Ошибка валидации", details: error });
      }
      res.status(500).json({
        error: "Ошибка сервера",
        details: error instanceof Error ? error.message : error,
      });
    }
  },
);

// Удалить шаблон (только если он принадлежит текущему пользователю)
router.delete(
  "/:id",
  authenticate,
  requirePermission("templates:delete"),
  async (req: AuthRequest, res) => {
    try {
      const templateId = Number(req.params.id);

      // Проверяем что шаблон принадлежит текущему пользователю
      const existing = await db
        .select()
        .from(templates)
        .where(and(eq(templates.id, templateId), eqFn(templates.createdById, req.userId!)))
        .limit(1);

      if (!existing || existing.length === 0) {
        return res.status(404).json({ error: "Шаблон не найден" });
      }

      await db.delete(templates).where(eq(templates.id, templateId)).run();

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({
        error: "Ошибка сервера",
        details: error instanceof Error ? error.message : error,
      });
    }
  },
);

export default router;
