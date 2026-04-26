import { Router } from "express";
import { db } from "../db/index.js";
import { incomes, orders, deliveries } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import {
  createIncomeSchema,
  updateIncomeSchema,
} from "../middleware/validators.js";
import { eq, and, desc, like, eq as eqOp } from "drizzle-orm";

const router = Router();

// Получить все доходы с фильтрацией
router.get("/", authenticate, (req: AuthRequest, res) => {
  try {
    const { isPaid, paymentMethod, orderId, id } = req.query;

    // Строим запрос с фильтрами
    const whereConditions = [];

    if (isPaid !== undefined) {
      whereConditions.push(eqOp(incomes.isPaid, isPaid === "true"));
    }
    if (paymentMethod) {
      whereConditions.push(
        eq(incomes.paymentMethod, paymentMethod as "cash" | "bank_transfer"),
      );
    }
    if (orderId) {
      whereConditions.push(eqOp(incomes.orderId, Number(orderId)));
    }
    if (id) {
      whereConditions.push(eqOp(incomes.id, Number(id)));
    }

    const query = db
      .select({
        id: incomes.id,
        incomeType: incomes.incomeType,
        paymentMethod: incomes.paymentMethod,
        isPaid: incomes.isPaid,
        orderId: incomes.orderId,
        deliveryId: incomes.deliveryId,
        amount: incomes.amount,
        paymentDate: incomes.paymentDate,
        createdAt: incomes.createdAt,
        updatedAt: incomes.updatedAt,
        // Данные заявки
        orderAddress: orders.address,
        orderType: orders.type,
        orderStatus: orders.status,
        // Данные доставки
        deliveryDateTime: deliveries.dateTime,
        deliveryCost: deliveries.cost,
      })
      .from(incomes)
      .leftJoin(orders, eq(incomes.orderId, orders.id))
      .leftJoin(deliveries, eq(incomes.deliveryId, deliveries.id))
      .orderBy(desc(incomes.createdAt));

    if (whereConditions.length > 0) {
      query.where(and(...whereConditions));
    }

    const allIncomes = query.all();

    res.json(allIncomes);
  } catch (error) {
    console.error("Error getting incomes:", error);
    res.status(500).json({
      error: "Ошибка сервера",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// Получить доход по ID с детальной информацией
router.get("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const incomeId = Number(req.params.id);

    const income = await db
      .select({
        id: incomes.id,
        incomeType: incomes.incomeType,
        paymentMethod: incomes.paymentMethod,
        isPaid: incomes.isPaid,
        orderId: incomes.orderId,
        deliveryId: incomes.deliveryId,
        amount: incomes.amount,
        paymentDate: incomes.paymentDate,
        createdAt: incomes.createdAt,
        updatedAt: incomes.updatedAt,
        // Данные заявки
        orderAddress: orders.address,
        orderType: orders.type,
        orderStatus: orders.status,
        orderCost: orders.cost,
        orderDateTime: orders.dateTime,
        // Данные доставки
        deliveryDateTime: deliveries.dateTime,
        deliveryCost: deliveries.cost,
        deliveryDriverId: deliveries.driverId,
        deliveryCarId: deliveries.carId,
      })
      .from(incomes)
      .leftJoin(orders, eq(incomes.orderId, orders.id))
      .leftJoin(deliveries, eq(incomes.deliveryId, deliveries.id))
      .where(eq(incomes.id, incomeId))
      .limit(1);

    if (!income || income.length === 0) {
      return res.status(404).json({ error: "Доход не найден" });
    }

    res.json(income[0]);
  } catch (error) {
    console.error("Error getting income:", error);
    res.status(500).json({
      error: "Ошибка сервера",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// Создать доход
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const data = createIncomeSchema.parse(req.body);
    const userId = req.userId!;
    const now = new Date().toISOString();

    // Проверяем существование заявки
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, data.orderId))
      .limit(1);

    if (!order || order.length === 0) {
      return res.status(404).json({ error: "Заявка не найдена" });
    }

    // Если вид дохода - оплата доставки, проверяем существование доставки
    if (data.incomeType === "delivery_payment") {
      if (!data.deliveryId) {
        return res.status(400).json({
          error:
            "Для вида дохода 'оплата доставки' необходимо указать deliveryId",
        });
      }

      const delivery = await db
        .select()
        .from(deliveries)
        .where(eq(deliveries.id, data.deliveryId))
        .limit(1);

      if (!delivery || delivery.length === 0) {
        return res.status(404).json({ error: "Доставка не найдена" });
      }

      // Проверяем что доставка принадлежит этой заявке
      if (delivery[0].orderId !== data.orderId) {
        return res.status(400).json({
          error: "Доставка не принадлежит указанной заявке",
        });
      }
    }

    const result = await db
      .insert(incomes)
      .values({
        incomeType: data.incomeType,
        paymentMethod: data.paymentMethod,
        isPaid: data.isPaid || false,
        orderId: data.orderId,
        deliveryId: data.deliveryId || null,
        amount: data.amount,
        paymentDate: data.paymentDate,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    const newIncome = await db
      .select()
      .from(incomes)
      .where(eq(incomes.id, Number(result.lastInsertRowid)))
      .limit(1);

    res.status(201).json(newIncome[0]);
  } catch (error) {
    console.error("Error creating income:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return res
        .status(400)
        .json({ error: "Ошибка валидации", details: error });
    }
    res.status(500).json({
      error: "Ошибка сервера",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// Обновить доход
router.put("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const data = updateIncomeSchema.parse(req.body);
    const incomeId = Number(req.params.id);
    const now = new Date().toISOString();

    // Получаем текущий доход для проверки
    const currentIncome = await db
      .select()
      .from(incomes)
      .where(eq(incomes.id, incomeId))
      .limit(1);

    if (!currentIncome || currentIncome.length === 0) {
      return res.status(404).json({ error: "Доход не найден" });
    }

    // Если изменяется incomeType на delivery_payment, проверяем deliveryId
    const newIncomeType = data.incomeType || currentIncome[0].incomeType;
    if (newIncomeType === "delivery_payment") {
      const newDeliveryId = data.deliveryId || currentIncome[0].deliveryId;
      if (!newDeliveryId) {
        return res.status(400).json({
          error:
            "Для вида дохода 'оплата доставки' необходимо указать deliveryId",
        });
      }

      const delivery = await db
        .select()
        .from(deliveries)
        .where(eq(deliveries.id, newDeliveryId))
        .limit(1);

      if (!delivery || delivery.length === 0) {
        return res.status(404).json({ error: "Доставка не найдена" });
      }
    }

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: now,
    };

    // Удаляем undefined значения
    for (const key of Object.keys(updateData)) {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    }

    await db
      .update(incomes)
      .set(updateData)
      .where(eq(incomes.id, incomeId))
      .run();

    const updatedIncome = await db
      .select()
      .from(incomes)
      .where(eq(incomes.id, incomeId))
      .limit(1);

    res.json(updatedIncome[0]);
  } catch (error) {
    console.error("Error updating income:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return res
        .status(400)
        .json({ error: "Ошибка валидации", details: error });
    }
    res.status(500).json({
      error: "Ошибка сервера",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// Удалить доход
router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const incomeId = Number(req.params.id);

    // Проверяем существование дохода
    const income = await db
      .select()
      .from(incomes)
      .where(eq(incomes.id, incomeId))
      .limit(1);

    if (!income || income.length === 0) {
      return res.status(404).json({ error: "Доход не найден" });
    }

    await db.delete(incomes).where(eq(incomes.id, incomeId)).run();

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting income:", error);
    res.status(500).json({
      error: "Ошибка сервера",
      details: error instanceof Error ? error.message : error,
    });
  }
});

export default router;
