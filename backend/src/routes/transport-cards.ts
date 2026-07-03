import { Router } from "express";
import { db } from "../db/index.js";
import {
  transportCards,
  transportCardExpenses,
  transportCardHistory,
  users,
} from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import { eq, and, desc, like, count } from "drizzle-orm";

const router = Router();

// Список транспортных карт с пагинацией
router.get(
  "/",
  authenticate,
  requirePermission("transport-cards:list"),
  async (req: AuthRequest, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = [1, 5, 10, 25, 50].includes(parseInt(req.query.limit as string))
        ? parseInt(req.query.limit as string)
        : 10;
      const offset = (page - 1) * limit;

      const cardNumber = req.query.cardNumber as string | undefined;
      const search = req.query.search as string | undefined;

      // Формируем условия WHERE
      const whereClause: Array<import("drizzle-orm").SQL<unknown>> = [];

      if (cardNumber) {
        whereClause.push(like(transportCards.cardNumber, `%${cardNumber}%`));
      }

      if (search) {
        const searchPattern = `%${search}%`;
        whereClause.push(like(transportCards.cardNumber, searchPattern));
      }

      // Получаем общее количество
      let totalQuery = db.select({ count: count() }).from(transportCards);
      if (whereClause.length > 0) {
        totalQuery.where(and(...whereClause));
      }
      const totalResult = await totalQuery;
      const totalRecords = totalResult[0].count;
      const totalPages = Math.ceil(totalRecords / limit);

      // Получаем карты с расходами
      const cards = await db
        .select({
          id: transportCards.id,
          cardNumber: transportCards.cardNumber,
          status: transportCards.status,
          createdAt: transportCards.createdAt,
          updatedAt: transportCards.updatedAt,
        })
        .from(transportCards)
        .limit(limit)
        .offset(offset);

      // Для каждой карты получаем расходы и общую сумму
      const cardsWithExpenses = await Promise.all(
        cards.map(async (card) => {
          const expenses = await db
            .select({
              id: transportCardExpenses.id,
              cardId: transportCardExpenses.cardId,
              amount: transportCardExpenses.amount,
              paymentDate: transportCardExpenses.paymentDate,
              createdAt: transportCardExpenses.createdAt,
            })
            .from(transportCardExpenses)
            .where(eq(transportCardExpenses.cardId, card.id))
            .orderBy(desc(transportCardExpenses.createdAt));

          const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

          return {
            ...card,
            expenses,
            totalExpenses,
          };
        }),
      );

      res.json({
        data: cardsWithExpenses,
        pagination: {
          page,
          limit,
          totalRecords,
          totalPages,
        },
      });
    } catch (error) {
      console.error("Error fetching transport cards:", error);
      res.status(500).json({ error: "Ошибка при получении списка транспортных карт" });
    }
  },
);

// Детали транспортной карты по ID
router.get(
  "/:id",
  authenticate,
  requirePermission("transport-cards:detail"),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const card = await db
        .select({
          id: transportCards.id,
          cardNumber: transportCards.cardNumber,
          status: transportCards.status,
          createdAt: transportCards.createdAt,
          updatedAt: transportCards.updatedAt,
        })
        .from(transportCards)
        .where(eq(transportCards.id, Number(id)))
        .limit(1);

      if (card.length === 0) {
        return res.status(404).json({ error: "Транспортная карта не найдена" });
      }

      // Получаем расходы
      const expenses = await db
        .select({
          id: transportCardExpenses.id,
          cardId: transportCardExpenses.cardId,
          amount: transportCardExpenses.amount,
          paymentDate: transportCardExpenses.paymentDate,
          createdAt: transportCardExpenses.createdAt,
        })
        .from(transportCardExpenses)
        .where(eq(transportCardExpenses.cardId, Number(id)))
        .orderBy(desc(transportCardExpenses.createdAt));

      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Получаем историю изменений
      const history = await db
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
        .where(eq(transportCardHistory.cardId, Number(id)))
        .orderBy(desc(transportCardHistory.createdAt));

      res.json({
        ...card[0],
        expenses,
        totalExpenses,
        history,
      });
    } catch (error) {
      console.error("Error fetching transport card:", error);
      res.status(500).json({ error: "Ошибка при получении транспортной карты" });
    }
  },
);

// Создание транспортной карты
router.post(
  "/",
  authenticate,
  requirePermission("transport-cards:create"),
  async (req: AuthRequest, res) => {
    try {
      const { cardNumber, status } = req.body;

      if (!cardNumber) {
        return res.status(400).json({ error: "Номер карты обязателен" });
      }

      const [newCard] = await db
        .insert(transportCards)
        .values({
          cardNumber,
          status: status || "active",
          createdAt: new Date().toISOString(),
        })
        .returning();

      res.status(201).json(newCard);
    } catch (error) {
      console.error("Error creating transport card:", error);
      res.status(500).json({ error: "Ошибка при создании транспортной карты" });
    }
  },
);

// Обновление транспортной карты
router.put(
  "/:id",
  authenticate,
  requirePermission("transport-cards:update"),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { cardNumber, status } = req.body;

      const existingCard = await db
        .select()
        .from(transportCards)
        .where(eq(transportCards.id, Number(id)))
        .limit(1);

      if (existingCard.length === 0) {
        return res.status(404).json({ error: "Транспортная карта не найдена" });
      }

      const updateData: Record<string, unknown> = {
        updatedAt: new Date().toISOString(),
      };

      if (cardNumber !== undefined) {
        updateData.cardNumber = cardNumber;
      }
      if (status !== undefined) {
        updateData.status = status;
      }

      const [updated] = await db
        .update(transportCards)
        .set(updateData)
        .where(eq(transportCards.id, Number(id)))
        .returning();

      // Запись в историю
      if (cardNumber !== undefined && cardNumber !== existingCard[0].cardNumber) {
        await db.insert(transportCardHistory).values({
          cardId: Number(id),
          userId: req.userId!,
          action: "card_updated",
          fieldName: "cardNumber",
          oldValue: existingCard[0].cardNumber,
          newValue: cardNumber,
          createdAt: new Date().toISOString(),
        });
      }

      if (status !== undefined && status !== existingCard[0].status) {
        await db.insert(transportCardHistory).values({
          cardId: Number(id),
          userId: req.userId!,
          action: "card_updated",
          fieldName: "status",
          oldValue: existingCard[0].status,
          newValue: status,
          createdAt: new Date().toISOString(),
        });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating transport card:", error);
      res.status(500).json({ error: "Ошибка при обновлении транспортной карты" });
    }
  },
);

// Удаление транспортной карты
router.delete(
  "/:id",
  authenticate,
  requirePermission("transport-cards:delete"),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      const deleted = await db
        .delete(transportCards)
        .where(eq(transportCards.id, Number(id)))
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({ error: "Транспортная карта не найдена" });
      }

      res.json({ message: "Транспортная карта успешно удалена" });
    } catch (error) {
      console.error("Error deleting transport card:", error);
      res.status(500).json({ error: "Ошибка при удалении транспортной карты" });
    }
  },
);

// Добавление расхода на карту
router.post(
  "/:cardId/expenses",
  authenticate,
  requirePermission("expenses:create"),
  async (req: AuthRequest, res) => {
    try {
      const { cardId } = req.params;
      const { amount, paymentDate } = req.body;

      if (!amount || !paymentDate) {
        return res.status(400).json({ error: "Сумма и дата обязательны" });
      }

      // Проверяем существование карты
      const card = await db
        .select()
        .from(transportCards)
        .where(eq(transportCards.id, Number(cardId)))
        .limit(1);

      if (card.length === 0) {
        return res.status(404).json({ error: "Транспортная карта не найдена" });
      }

      const [newExpense] = await db
        .insert(transportCardExpenses)
        .values({
          cardId: Number(cardId),
          amount,
          paymentDate,
          createdAt: new Date().toISOString(),
        })
        .returning();

      // Запись в историю
      await db.insert(transportCardHistory).values({
        cardId: Number(cardId),
        userId: req.userId!,
        action: "expense_added",
        fieldName: "expense",
        newValue: `${amount} руб. | ${paymentDate}`,
        createdAt: new Date().toISOString(),
      });

      res.status(201).json(newExpense);
    } catch (error) {
      console.error("Error adding expense:", error);
      res.status(500).json({ error: "Ошибка при добавлении расхода" });
    }
  },
);

// Удаление расхода
router.delete(
  "/:cardId/expenses/:expenseId",
  authenticate,
  requirePermission("expenses:delete"),
  async (req: AuthRequest, res) => {
    try {
      const { expenseId } = req.params;

      // Получаем расход перед удалением
      const [deletedExpense] = await db
        .select()
        .from(transportCardExpenses)
        .where(eq(transportCardExpenses.id, Number(expenseId)))
        .limit(1);

      if (!deletedExpense) {
        return res.status(404).json({ error: "Расход не найден" });
      }

      await db.delete(transportCardExpenses).where(eq(transportCardExpenses.id, Number(expenseId)));

      // Запись в историю
      await db.insert(transportCardHistory).values({
        cardId: deletedExpense.cardId,
        userId: req.userId!,
        action: "expense_removed",
        fieldName: "expense",
        oldValue: `${deletedExpense.amount} руб. | ${deletedExpense.paymentDate}`,
        createdAt: new Date().toISOString(),
      });

      res.json({ message: "Расход успешно удалён" });
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ error: "Ошибка при удалении расхода" });
    }
  },
);

export default router;
