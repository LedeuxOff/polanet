import { Router } from "express";
import { db } from "../db/index.js";
import { expenses, transportCards, transportCardHistory, drivers, users } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

// Список расходов с фильтрацией
router.get("/", authenticate, (req: AuthRequest, res) => {
  try {
    const { id, expenseType, paymentType, transportCardId, driverId } = req.query;

    const whereConditions = [];

    if (id) {
      whereConditions.push(eq(expenses.id, Number(id)));
    }
    if (expenseType) {
      whereConditions.push(eq(expenses.expenseType, expenseType as "salary" | "fuel"));
    }
    if (paymentType) {
      whereConditions.push(eq(expenses.paymentType, paymentType as "cash" | "bank_transfer"));
    }
    if (transportCardId) {
      whereConditions.push(eq(expenses.transportCardId, Number(transportCardId)));
    }
    if (driverId) {
      whereConditions.push(eq(expenses.driverId, Number(driverId)));
    }

    const query = db
      .select({
        id: expenses.id,
        expenseType: expenses.expenseType,
        paymentType: expenses.paymentType,
        transportCardId: expenses.transportCardId,
        driverId: expenses.driverId,
        dateTime: expenses.dateTime,
        amount: expenses.amount,
        comment: expenses.comment,
        createdAt: expenses.createdAt,
        updatedAt: expenses.updatedAt,
      })
      .from(expenses)
      .orderBy(desc(expenses.createdAt));

    if (whereConditions.length > 0) {
      query.where(and(...whereConditions));
    }

    const result = query;
    res.json(result);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Ошибка при получении расходов" });
  }
});

// Детали расхода по ID
router.get("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const expense = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, Number(id)))
      .limit(1);

    if (expense.length === 0) {
      return res.status(404).json({ error: "Расход не найден" });
    }

    res.json(expense[0]);
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({ error: "Ошибка при получении расхода" });
  }
});

// Создание расхода
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const userId = req.userId;

    // Валидация типов
    const validExpenseTypes = ["salary", "fuel"];
    const validPaymentTypes = ["cash", "bank_transfer"];

    if (!validExpenseTypes.includes(data.expenseType)) {
      return res.status(400).json({ error: "Неверный тип расхода" });
    }

    if (!validPaymentTypes.includes(data.paymentType)) {
      return res.status(400).json({ error: "Неверный тип оплаты" });
    }

    // Проверка: для fuel нужен transportCardId, для salary нужен driverId
    if (data.expenseType === "fuel" && !data.transportCardId) {
      return res.status(400).json({
        error: "Для расхода 'топливо' необходима привязка к транспортной карте",
      });
    }

    if (data.expenseType === "salary" && !data.driverId) {
      return res.status(400).json({
        error: "Для расхода 'зарплата' необходима привязка к водителю",
      });
    }

    const newExpense = {
      expenseType: data.expenseType,
      paymentType: data.paymentType,
      transportCardId: data.transportCardId || null,
      driverId: data.driverId || null,
      dateTime: data.dateTime,
      amount: data.amount,
      comment: data.comment || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const [inserted] = await db.insert(expenses).values(newExpense).returning();

    // Запись в историю при создании расхода с привязкой к транспортной карте
    if (inserted.transportCardId) {
      const paymentTypeLabel = data.paymentType === "cash" ? "Наличные" : "Безналичные";
      const expenseTypeLabel = data.expenseType === "fuel" ? "Топливо" : "Зарплата";
      db.insert(transportCardHistory)
        .values({
          cardId: inserted.transportCardId,
          userId: userId!,
          action: "expense_added",
          fieldName: "expense",
          newValue: `${expenseTypeLabel} | ${paymentTypeLabel} | ${data.amount} руб. | ${data.dateTime}`,
          createdAt: new Date().toISOString(),
        })
        .run();
    }

    res.status(201).json(inserted);
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ error: "Ошибка при создании расхода" });
  }
});

// Обновление расхода
router.put("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const [updated] = await db
      .update(expenses)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(expenses.id, Number(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Расход не найден" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Ошибка при обновлении расхода" });
  }
});

// Удаление расхода
router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Сначала получаем расход перед удалением
    const [deleted] = await db
      .delete(expenses)
      .where(eq(expenses.id, Number(id)))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: "Расход не найден" });
    }

    // Запись в историю при удалении расхода с привязкой к транспортной карте
    if (deleted.transportCardId) {
      const expenseTypeLabel = deleted.expenseType === "fuel" ? "Топливо" : "Зарплата";
      db.insert(transportCardHistory)
        .values({
          cardId: deleted.transportCardId,
          userId: userId!,
          action: "expense_removed",
          fieldName: "expense",
          oldValue: `${expenseTypeLabel} | ${deleted.amount} руб. | ${deleted.dateTime}`,
          createdAt: new Date().toISOString(),
        })
        .run();
    }

    res.json({ message: "Расход успешно удалён" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Ошибка при удалении расхода" });
  }
});

export default router;
