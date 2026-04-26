import { Router } from "express";
import { db } from "../db/index.js";
import {
  orders,
  payments,
  orderHistory,
  users,
  deliveries,
} from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import {
  createOrderSchema,
  updateOrderSchema,
  createPaymentSchema,
  quickCreateOrderSchema,
} from "../middleware/validators.js";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

// Вспомогательная функция для записи в историю
async function logHistory(
  orderId: number,
  userId: number,
  action: string,
  fieldName?: string,
  oldValue?: string,
  newValue?: string,
) {
  db.insert(orderHistory)
    .values({
      orderId,
      userId,
      action,
      fieldName,
      oldValue,
      newValue,
      createdAt: new Date().toISOString(),
    })
    .run();
}

// Получить все заявки
router.get("/", authenticate, (req: AuthRequest, res) => {
  try {
    const allOrders = db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .all();

    // Для каждой заявки получаем выплаты и доставки
    const ordersWithPayments = allOrders.map((order) => {
      const orderPayments = db
        .select()
        .from(payments)
        .where(eq(payments.orderId, order.id))
        .all();
      const received = orderPayments.reduce((sum, p) => sum + p.amount, 0);

      // Получаем доставки
      const orderDeliveries = db
        .select()
        .from(deliveries)
        .where(eq(deliveries.orderId, order.id))
        .all();
      // Реализовано - сумма оплаченных доставок
      const completed = orderDeliveries
        .filter((d) => d.isPaid)
        .reduce((sum, d) => sum + d.cost, 0);

      // Расчет долгов
      // Долг клиента = реализовано - получено (если > 0)
      // Долг компании = получено - реализовано (если > 0)
      const customerDebt = completed > received ? completed - received : 0;
      const companyDebt = received > completed ? received - completed : 0;

      return {
        ...order,
        payments: orderPayments,
        received,
        completed,
        customerDebt,
        companyDebt,
        isPaid: received >= order.cost,
        paymentStatus:
          received === 0
            ? "unpaid"
            : received >= order.cost
              ? "paid"
              : "partial",
      };
    });

    res.json(ordersWithPayments);
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({
      error: "Ошибка сервера",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// Получить заявку по ID
router.get("/:id", authenticate, (req: AuthRequest, res) => {
  try {
    const order = db
      .select()
      .from(orders)
      .where(eq(orders.id, Number(req.params.id)))
      .get();

    if (!order) {
      return res.status(404).json({ error: "Заявка не найдена" });
    }

    // Получаем выплаты
    const orderPayments = db
      .select()
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .all();
    const received = orderPayments.reduce((sum, p) => sum + p.amount, 0);

    // Получаем доставки
    const orderDeliveries = db
      .select()
      .from(deliveries)
      .where(eq(deliveries.orderId, order.id))
      .all();
    // Реализовано - сумма оплаченных доставок
    const completed = orderDeliveries
      .filter((d) => d.isPaid)
      .reduce((sum, d) => sum + d.cost, 0);

    // Расчет долгов
    // Долг клиента = реализовано - получено (если > 0)
    // Долг компании = получено - реализовано (если > 0)
    const customerDebt = completed > received ? completed - received : 0;
    const companyDebt = received > completed ? received - completed : 0;

    // Получаем историю
    const history = db
      .select({
        id: orderHistory.id,
        orderId: orderHistory.orderId,
        userId: orderHistory.userId,
        action: orderHistory.action,
        fieldName: orderHistory.fieldName,
        oldValue: orderHistory.oldValue,
        newValue: orderHistory.newValue,
        createdAt: orderHistory.createdAt,
        userLastName: users.lastName,
        userFirstName: users.firstName,
        userMiddleName: users.middleName,
      })
      .from(orderHistory)
      .leftJoin(users, eq(orderHistory.userId, users.id))
      .where(eq(orderHistory.orderId, order.id))
      .orderBy(desc(orderHistory.createdAt))
      .all();

    res.json({
      ...order,
      payments: orderPayments,
      received,
      completed,
      customerDebt,
      companyDebt,
      isPaid: received >= order.cost,
      paymentStatus:
        received === 0 ? "unpaid" : received >= order.cost ? "paid" : "partial",
      history,
    });
  } catch (error) {
    console.error("Error getting order:", error);
    res.status(500).json({
      error: "Ошибка сервера",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// Создать заявку (быстрое создание)
router.post("/quick", authenticate, async (req: AuthRequest, res) => {
  try {
    const data = quickCreateOrderSchema.parse(req.body);
    const userId = req.userId!;
    const now = new Date().toISOString();

    const result = db
      .insert(orders)
      .values({
        ...data,
        createdById: userId,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    const newOrder = db
      .select()
      .from(orders)
      .where(eq(orders.id, Number(result.lastInsertRowid)))
      .get();

    // Запись в историю
    await logHistory(newOrder!.id, userId, "created");

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order (quick):", error);
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

// Создать заявку
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const data = createOrderSchema.parse(req.body);
    const userId = req.userId!;
    const now = new Date().toISOString();

    const result = db
      .insert(orders)
      .values({
        ...data,
        createdById: userId,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    const newOrder = db
      .select()
      .from(orders)
      .where(eq(orders.id, Number(result.lastInsertRowid)))
      .get();

    // Запись в историю
    await logHistory(newOrder!.id, userId, "created");

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
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

// Обновить заявку
router.put("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const data = updateOrderSchema.parse(req.body);
    const orderId = Number(req.params.id);
    const userId = req.userId!;
    const now = new Date().toISOString();

    // Получаем текущую заявку для сравнения
    const currentOrder = db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .get();

    if (!currentOrder) {
      return res.status(404).json({ error: "Заявка не найдена" });
    }

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: now,
    };

    db.update(orders).set(updateData).where(eq(orders.id, orderId)).run();

    // Запись изменений в историю
    for (const [key, value] of Object.entries(data)) {
      const oldValue = currentOrder[key as keyof typeof currentOrder];
      if (oldValue !== value) {
        await logHistory(
          orderId,
          userId,
          key === "status" ? "status_changed" : "updated",
          key,
          String(oldValue),
          String(value),
        );
      }
    }

    const updatedOrder = db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .get();

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
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

// Удалить заявку
router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const orderId = Number(req.params.id);
    const userId = req.userId!;

    // Получаем заявку для записи в историю
    const order = db.select().from(orders).where(eq(orders.id, orderId)).get();

    if (!order) {
      return res.status(404).json({ error: "Заявка не найдена" });
    }

    // Удаляем заявку (выплаты и история удалятся каскадом)
    db.delete(orders).where(eq(orders.id, orderId)).run();

    // Запись в историю (перед удалением)
    await logHistory(orderId, userId, "deleted");

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      error: "Ошибка сервера",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// Добавить выплату
router.post("/:id/payments", authenticate, async (req: AuthRequest, res) => {
  try {
    const orderId = Number(req.params.id);
    const userId = req.userId!;
    const data = createPaymentSchema.parse(req.body);
    const now = new Date().toISOString();

    // Проверяем существование заявки
    const order = db.select().from(orders).where(eq(orders.id, orderId)).get();

    if (!order) {
      return res.status(404).json({ error: "Заявка не найдена" });
    }

    // Если тип "delivery", проверяем что deliveryId указан
    if (data.type === "delivery" && !data.deliveryId) {
      return res.status(400).json({
        error: 'Для типа выплаты "delivery" необходимо указать deliveryId',
      });
    }

    const result = db
      .insert(payments)
      .values({
        orderId,
        deliveryId: data.deliveryId,
        amount: data.amount,
        paymentDate: data.paymentDate,
        type: data.type,
        createdAt: now,
      })
      .run();

    const newPayment = db
      .select()
      .from(payments)
      .where(eq(payments.id, Number(result.lastInsertRowid)))
      .get();

    // Если выплата для доставки, обновляем доставку
    if (data.type === "delivery" && data.deliveryId) {
      db.update(deliveries)
        .set({
          isPaid: true,
          paymentId: Number(result.lastInsertRowid),
          updatedAt: now,
        })
        .where(eq(deliveries.id, data.deliveryId))
        .run();
    }

    // Запись в историю
    await logHistory(
      orderId,
      userId,
      "payment_added",
      "payment",
      undefined,
      `Выплата ${data.amount} руб. (${data.type}) от ${data.paymentDate}`,
    );

    res.status(201).json(newPayment);
  } catch (error) {
    console.error("Error adding payment:", error);
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

// Удалить выплату
router.delete(
  "/:orderId/payments/:paymentId",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const { orderId, paymentId } = req.params;
      const userId = req.userId!;
      const now = new Date().toISOString();

      // Получаем выплату для записи в историю
      const payment = db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.id, Number(paymentId)),
            eq(payments.orderId, Number(orderId)),
          ),
        )
        .get();

      if (!payment) {
        return res.status(404).json({ error: "Выплата не найдена" });
      }

      // Если выплата связана с доставкой, помечаем доставку как неоплаченную
      if (payment.deliveryId) {
        db.update(deliveries)
          .set({ isPaid: false, paymentId: null, updatedAt: now })
          .where(eq(deliveries.id, payment.deliveryId))
          .run();
      }

      db.delete(payments)
        .where(
          and(
            eq(payments.id, Number(paymentId)),
            eq(payments.orderId, Number(orderId)),
          ),
        )
        .run();

      // Запись в историю
      await logHistory(
        Number(orderId),
        userId,
        "payment_removed",
        "payment",
        `Выплата ${payment.amount} руб. от ${payment.paymentDate}`,
        undefined,
      );

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json({
        error: "Ошибка сервера",
        details: error instanceof Error ? error.message : error,
      });
    }
  },
);

// Получить историю заявки
router.get("/:id/history", authenticate, async (req: AuthRequest, res) => {
  try {
    const history = db
      .select({
        id: orderHistory.id,
        orderId: orderHistory.orderId,
        userId: orderHistory.userId,
        action: orderHistory.action,
        fieldName: orderHistory.fieldName,
        oldValue: orderHistory.oldValue,
        newValue: orderHistory.newValue,
        createdAt: orderHistory.createdAt,
        userLastName: users.lastName,
        userFirstName: users.firstName,
        userMiddleName: users.middleName,
      })
      .from(orderHistory)
      .leftJoin(users, eq(orderHistory.userId, users.id))
      .where(eq(orderHistory.orderId, Number(req.params.id)))
      .orderBy(desc(orderHistory.createdAt))
      .all();

    res.json(history);
  } catch (error) {
    console.error("Error getting history:", error);
    res.status(500).json({
      error: "Ошибка сервера",
      details: error instanceof Error ? error.message : error,
    });
  }
});

export default router;
