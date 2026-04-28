import { Router } from "express";
import { db } from "../db/index.js";
import {
  transportCards,
  expenses,
  transportCardHistory,
  drivers,
  users,
  permissions,
  rolePermissions,
} from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import { createTransportCardSchema, updateTransportCardSchema } from "../middleware/validators.js";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

// Вспомогательная функция для записи в историю
async function logHistory(
  cardId: number,
  userId: number,
  action: string,
  fieldName?: string,
  oldValue?: string,
  newValue?: string,
) {
  db.insert(transportCardHistory)
    .values({
      cardId,
      userId,
      action,
      fieldName,
      oldValue,
      newValue,
      createdAt: new Date().toISOString(),
    })
    .run();
}

// Получить все карты
router.get(
  "/",
  authenticate,
  requirePermission("transport-cards:list"),
  (req: AuthRequest, res) => {
    try {
      const allCards = db
        .select()
        .from(transportCards)
        .orderBy(desc(transportCards.createdAt))
        .all();

      // Проверяем наличие права на просмотр расходов
      const hasExpensesListPermission = req.user?.roleId
        ? db
            .select({ count: permissions.id })
            .from(rolePermissions)
            .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
            .where(
              and(
                eq(rolePermissions.roleId, req.user.roleId),
                eq(permissions.code, "expenses:list"),
              ),
            )
            .all().length > 0
        : false;

      // Для каждой карты получаем водителя и расходы
      const cardsWithDetails = allCards.map((card) => {
        const driver = card.driverId
          ? db.select().from(drivers).where(eq(drivers.id, card.driverId)).get()
          : null;

        let cardExpenses: any[] = [];
        let totalExpenses = 0;

        if (hasExpensesListPermission) {
          cardExpenses = db
            .select()
            .from(expenses)
            .where(eq(expenses.transportCardId, card.id))
            .all();
          totalExpenses = cardExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        }

        return {
          ...card,
          driver,
          expenses: cardExpenses,
          totalExpenses,
        };
      });

      res.json(cardsWithDetails);
    } catch (error) {
      console.error("Error getting transport cards:", error);
      res
        .status(500)
        .json({ error: "Ошибка сервера", details: error instanceof Error ? error.message : error });
    }
  },
);

// Получить карту по ID
router.get(
  "/:id",
  authenticate,
  requirePermission("transport-cards:detail"),
  (req: AuthRequest, res) => {
    try {
      const card = db
        .select()
        .from(transportCards)
        .where(eq(transportCards.id, Number(req.params.id)))
        .get();

      if (!card) {
        return res.status(404).json({ error: "Транспортная карта не найдена" });
      }

      // Получаем водителя
      const driver = card.driverId
        ? db.select().from(drivers).where(eq(drivers.id, card.driverId)).get()
        : null;

      let cardExpenses: any[] = [];
      let totalExpenses = 0;

      // Проверяем наличие права на просмотр расходов
      if (req.user?.roleId) {
        const hasExpensesListPermission =
          db
            .select({ count: permissions.id })
            .from(rolePermissions)
            .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
            .where(
              and(
                eq(rolePermissions.roleId, req.user.roleId),
                eq(permissions.code, "expenses:list"),
              ),
            )
            .all().length > 0;

        if (hasExpensesListPermission) {
          // Получаем расходы (новая сущность Expense)
          cardExpenses = db
            .select()
            .from(expenses)
            .where(eq(expenses.transportCardId, card.id))
            .all();
          totalExpenses = cardExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        }
      }

      // Получаем историю
      const history = db
        .select({
          id: transportCardHistory.id,
          cardId: transportCardHistory.cardId,
          userId: transportCardHistory.userId,
          action: transportCardHistory.action,
          fieldName: transportCardHistory.fieldName,
          oldValue: transportCardHistory.oldValue,
          newValue: transportCardHistory.newValue,
          createdAt: transportCardHistory.createdAt,
          userLastName: users.lastName,
          userFirstName: users.firstName,
          userMiddleName: users.middleName,
        })
        .from(transportCardHistory)
        .leftJoin(users, eq(transportCardHistory.userId, users.id))
        .where(eq(transportCardHistory.cardId, card.id))
        .orderBy(desc(transportCardHistory.createdAt))
        .all();

      res.json({
        ...card,
        driver,
        expenses: cardExpenses,
        totalExpenses,
        history,
      });
    } catch (error) {
      console.error("Error getting transport card:", error);
      res
        .status(500)
        .json({ error: "Ошибка сервера", details: error instanceof Error ? error.message : error });
    }
  },
);

// Создать карту
router.post(
  "/",
  authenticate,
  requirePermission("transport-cards:create"),
  async (req: AuthRequest, res) => {
    try {
      const data = createTransportCardSchema.parse(req.body);
      const userId = req.userId!;
      const now = new Date().toISOString();

      // Проверка на дубликат номера карты
      const existingCard = db
        .select()
        .from(transportCards)
        .where(eq(transportCards.cardNumber, data.cardNumber))
        .get();

      if (existingCard) {
        return res.status(409).json({ error: "Карта с таким номером уже существует" });
      }

      const result = db
        .insert(transportCards)
        .values({
          cardNumber: data.cardNumber,
          status: data.status || "active",
          driverId: data.driverId || null,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      const newCard = db
        .select()
        .from(transportCards)
        .where(eq(transportCards.id, Number(result.lastInsertRowid)))
        .get();

      // Запись в историю
      await logHistory(newCard!.id, userId, "created");

      res.status(201).json(newCard);
    } catch (error) {
      console.error("Error creating transport card:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Ошибка валидации", details: error });
      }
      res
        .status(500)
        .json({ error: "Ошибка сервера", details: error instanceof Error ? error.message : error });
    }
  },
);

// Обновить карту
router.put(
  "/:id",
  authenticate,
  requirePermission("transport-cards:update"),
  async (req: AuthRequest, res) => {
    try {
      const data = updateTransportCardSchema.parse(req.body);
      const cardId = Number(req.params.id);
      const userId = req.userId!;
      const now = new Date().toISOString();

      // Получаем текущую карту для сравнения
      const currentCard = db
        .select()
        .from(transportCards)
        .where(eq(transportCards.id, cardId))
        .get();

      if (!currentCard) {
        return res.status(404).json({ error: "Транспортная карта не найдена" });
      }

      const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: now,
      };

      db.update(transportCards).set(updateData).where(eq(transportCards.id, cardId)).run();

      // Запись изменений в историю
      if (data.cardNumber && data.cardNumber !== currentCard.cardNumber) {
        await logHistory(
          cardId,
          userId,
          "updated",
          "cardNumber",
          currentCard.cardNumber,
          data.cardNumber,
        );
      }

      if (data.status !== undefined && data.status !== currentCard.status) {
        const oldValue = currentCard.status === "active" ? "Активна" : "Неактивна";
        const newValue = data.status === "active" ? "Активна" : "Неактивна";
        await logHistory(cardId, userId, "status_changed", "status", oldValue, newValue);
      }

      if (data.driverId !== undefined && data.driverId !== currentCard.driverId) {
        const action = data.driverId ? "driver_assigned" : "driver_unassigned";
        const oldValue = currentCard.driverId ? `Driver ${currentCard.driverId}` : "None";
        const newValue = data.driverId ? `Driver ${data.driverId}` : "None";

        await logHistory(cardId, userId, action, "driverId", oldValue, newValue);
      }

      const updatedCard = db
        .select()
        .from(transportCards)
        .where(eq(transportCards.id, cardId))
        .get();

      res.json(updatedCard);
    } catch (error) {
      console.error("Error updating transport card:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Ошибка валидации", details: error });
      }
      res
        .status(500)
        .json({ error: "Ошибка сервера", details: error instanceof Error ? error.message : error });
    }
  },
);

// Удалить карту
router.delete(
  "/:id",
  authenticate,
  requirePermission("transport-cards:delete"),
  async (req: AuthRequest, res) => {
    try {
      const cardId = Number(req.params.id);
      const userId = req.userId!;

      const card = db.select().from(transportCards).where(eq(transportCards.id, cardId)).get();

      if (!card) {
        return res.status(404).json({ error: "Транспортная карта не найдена" });
      }

      // Запись в историю перед удалением
      await logHistory(cardId, userId, "deleted");

      db.delete(transportCards).where(eq(transportCards.id, cardId)).run();

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting transport card:", error);
      res
        .status(500)
        .json({ error: "Ошибка сервера", details: error instanceof Error ? error.message : error });
    }
  },
);

export default router;
