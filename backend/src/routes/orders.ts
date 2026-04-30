import { Router } from "express";
import { db } from "../db/index.js";
import {
  orders,
  payments,
  orderHistory,
  users,
  deliveries,
  incomes,
  clients,
} from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import {
  createOrderSchema,
  updateOrderSchema,
  createPaymentSchema,
  quickCreateOrderSchema,
  validateOrderStatusTransition,
  orderStatusTransitions,
} from "../middleware/validators.js";
import { eq, and, desc, sql } from "drizzle-orm";

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

// Получить все заявки с фильтрами
router.get("/", authenticate, requirePermission("orders:list"), (req: AuthRequest, res) => {
  try {
    // Парсинг query параметров
    const queryId = req.query.id as string;
    const queryStatus = req.query.status as string;
    const queryCustomerDebt = req.query.customerDebt as string;
    const queryCompanyDebt = req.query.companyDebt as string;
    const queryDateFrom = req.query.dateFrom as string;
    const queryDateTo = req.query.dateTo as string;

    // Получаем все заявки
    const allOrders = db.select().from(orders).orderBy(desc(orders.createdAt)).all();

    // Применяем серверные фильтры
    let filteredOrders = allOrders;

    // Фильтр по ID заявки (поиск по номеру)
    if (queryId) {
      const orderId = Number(queryId);
      filteredOrders = filteredOrders.filter((o) => o.id === orderId);
    }

    // Фильтр по статусу
    if (queryStatus) {
      filteredOrders = filteredOrders.filter((o) => o.status === queryStatus);
    }

    // Фильтр по дате создания
    if (queryDateFrom || queryDateTo) {
      const dateFrom = queryDateFrom ? new Date(queryDateFrom).toISOString() : undefined;
      const dateTo = queryDateTo
        ? new Date(`${queryDateTo}T23:59:59.999`).toISOString()
        : undefined;

      filteredOrders = filteredOrders.filter((o) => {
        const orderDate = new Date(o.createdAt).getTime();
        if (dateFrom && dateTo) {
          const fromTime = new Date(dateFrom).getTime();
          const toTime = new Date(dateTo).getTime();
          return orderDate >= fromTime && orderDate <= toTime;
        }
        if (dateFrom) {
          const fromTime = new Date(dateFrom).getTime();
          return orderDate >= fromTime;
        }
        if (dateTo) {
          const toTime = new Date(dateTo).getTime();
          return orderDate <= toTime;
        }
        return true;
      });
    }

    // Для каждой заявки получаем доходы и вычисляем финансовые значения, а также данные клиента
    const ordersWithFinances = filteredOrders.map((order) => {
      // Получаем данные клиента
      const client = order.clientId
        ? db.select().from(clients).where(eq(clients.id, order.clientId)).get()
        : null;

      // Получаем доходы для заявки
      const orderIncomes = db.select().from(incomes).where(eq(incomes.orderId, order.id)).all();

      // Сумма предоплат с isPaid=true
      const prepaymentTotal = orderIncomes
        .filter((i) => i.incomeType === "prepayment" && i.isPaid)
        .reduce((sum, i) => sum + i.amount, 0);

      // Сумма оплат доставки с isPaid=true
      const deliveryPaymentTotal = orderIncomes
        .filter((i) => i.incomeType === "delivery_payment" && i.isPaid)
        .reduce((sum, i) => sum + i.amount, 0);

      // Получено средств - максимум между предоплатами и доставками (чтобы не дублировать)
      const receivedAmount = Math.max(prepaymentTotal, deliveryPaymentTotal);

      // Ожидает подтверждения - все доходы с isPaid=false
      const pendingAmount = orderIncomes
        .filter((i) => !i.isPaid)
        .reduce((sum, i) => sum + i.amount, 0);

      // Сумма всех доставок (независимо от isPaid)
      const deliveryIncomes = orderIncomes
        .filter((i) => i.incomeType === "delivery_payment")
        .reduce((sum, i) => sum + i.amount, 0);

      // Долг клиента - когда сумма доставок больше полученной (клиент должен за услуги)
      const customerDebt = Math.max(0, deliveryIncomes - receivedAmount);

      // Долг компании - сумма предоплат минус оплаченные доставки (компания должна оказать услуги)
      const companyDebt = Math.max(0, prepaymentTotal - deliveryPaymentTotal);

      // Формируем имя клиента: для юрлица - название организации, для физлица - ФИО
      let clientName: string | null = null;
      if (client) {
        if (client.type === "legal" && client.organizationName) {
          clientName = client.organizationName;
        } else if (
          client.type === "individual" &&
          client.lastName &&
          client.firstName &&
          client.middleName
        ) {
          clientName = `${client.lastName} ${client.firstName} ${client.middleName}`;
        } else if (client.type === "individual" && client.lastName && client.firstName) {
          clientName = `${client.lastName} ${client.firstName}`;
        }
      }

      return {
        ...order,
        receivedAmount,
        pendingAmount,
        customerDebt,
        companyDebt,
        clientName,
      };
    });

    // Применяем фильтры по долгам (после вычисления финансовых значений)
    let finalOrders = ordersWithFinances;

    if (queryCustomerDebt === "has") {
      finalOrders = finalOrders.filter((o) => (o.customerDebt ?? 0) > 0);
    } else if (queryCustomerDebt === "none") {
      finalOrders = finalOrders.filter((o) => (o.customerDebt ?? 0) === 0);
    }

    if (queryCompanyDebt === "has") {
      finalOrders = finalOrders.filter((o) => (o.companyDebt ?? 0) > 0);
    } else if (queryCompanyDebt === "none") {
      finalOrders = finalOrders.filter((o) => (o.companyDebt ?? 0) === 0);
    }

    res.json(finalOrders);
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({
      error: "Ошибка сервера",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// Получить заявку по ID
router.get("/:id", authenticate, requirePermission("orders:detail"), (req: AuthRequest, res) => {
  try {
    const order = db
      .select()
      .from(orders)
      .where(eq(orders.id, Number(req.params.id)))
      .get();

    if (!order) {
      return res.status(404).json({ error: "Заявка не найдена" });
    }

    // Получаем доходы для заявки
    const orderIncomes = db.select().from(incomes).where(eq(incomes.orderId, order.id)).all();

    // Сумма предоплат с isPaid=true
    const prepaymentTotal = orderIncomes
      .filter((i) => i.incomeType === "prepayment" && i.isPaid)
      .reduce((sum, i) => sum + i.amount, 0);

    // Сумма оплат доставки с isPaid=true
    const deliveryPaymentTotal = orderIncomes
      .filter((i) => i.incomeType === "delivery_payment" && i.isPaid)
      .reduce((sum, i) => sum + i.amount, 0);

    // Получено средств - максимум между предоплатами и доставками (чтобы не дублировать)
    const receivedAmount = Math.max(prepaymentTotal, deliveryPaymentTotal);

    // Ожидает подтверждения - все доходы с isPaid=false
    const pendingAmount = orderIncomes
      .filter((i) => !i.isPaid)
      .reduce((sum, i) => sum + i.amount, 0);

    // Сумма всех доставок (независимо от isPaid)
    const deliveryIncomes = orderIncomes
      .filter((i) => i.incomeType === "delivery_payment")
      .reduce((sum, i) => sum + i.amount, 0);

    // Долг клиента - когда сумма доставок больше полученной (клиент должен за услуги)
    const customerDebt = Math.max(0, deliveryIncomes - receivedAmount);

    // Долг компании - сумма предоплат минус оплаченные доставки (компания должна оказать услуги)
    const companyDebt = Math.max(0, prepaymentTotal - deliveryPaymentTotal);

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
      receivedAmount,
      pendingAmount,
      customerDebt,
      companyDebt,
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
router.post(
  "/quick",
  authenticate,
  requirePermission("orders:create"),
  async (req: AuthRequest, res) => {
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
        return res.status(400).json({ error: "Ошибка валидации", details: error });
      }
      res.status(500).json({
        error: "Ошибка сервера",
        details: error instanceof Error ? error.message : error,
      });
    }
  },
);

// Создать заявку
router.post(
  "/",
  authenticate,
  requirePermission("orders:create"),
  async (req: AuthRequest, res) => {
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
        return res.status(400).json({ error: "Ошибка валидации", details: error });
      }
      res.status(500).json({
        error: "Ошибка сервера",
        details: error instanceof Error ? error.message : error,
      });
    }
  },
);

// Обновить заявку
router.put(
  "/:id",
  authenticate,
  requirePermission("orders:update"),
  async (req: AuthRequest, res) => {
    try {
      const data = updateOrderSchema.parse(req.body);
      const orderId = Number(req.params.id);
      const userId = req.userId!;
      const now = new Date().toISOString();

      // Получаем текущую заявку для сравнения
      const currentOrder = db.select().from(orders).where(eq(orders.id, orderId)).get();

      if (!currentOrder) {
        return res.status(404).json({ error: "Заявка не найдена" });
      }

      // Валидация перехода статуса
      if (data.status && data.status !== currentOrder.status) {
        const isValid = validateOrderStatusTransition(currentOrder.status, data.status);
        if (!isValid) {
          const allowedTransitions = orderStatusTransitions[currentOrder.status] || [];
          return res.status(400).json({
            error: "Недопустимый переход статуса",
            details: `Из статуса "${currentOrder.status}" можно перейти в: ${allowedTransitions.join(", ") || "никакой (конечный статус)"}`,
          });
        }
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

      const updatedOrder = db.select().from(orders).where(eq(orders.id, orderId)).get();

      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error);
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

// Удалить заявку
router.delete(
  "/:id",
  authenticate,
  requirePermission("orders:delete"),
  async (req: AuthRequest, res) => {
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
  },
);

// Добавить выплату
router.post(
  "/:id/payments",
  authenticate,
  requirePermission("orders:payment"),
  async (req: AuthRequest, res) => {
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
        return res.status(400).json({ error: "Ошибка валидации", details: error });
      }
      res.status(500).json({
        error: "Ошибка сервера",
        details: error instanceof Error ? error.message : error,
      });
    }
  },
);

// Удалить выплату
router.delete(
  "/:orderId/payments/:paymentId",
  authenticate,
  requirePermission("orders:payment"),
  async (req: AuthRequest, res) => {
    try {
      const { orderId, paymentId } = req.params;
      const userId = req.userId!;
      const now = new Date().toISOString();

      // Получаем выплату для записи в историю
      const payment = db
        .select()
        .from(payments)
        .where(and(eq(payments.id, Number(paymentId)), eq(payments.orderId, Number(orderId))))
        .get();

      if (!payment) {
        return res.status(404).json({ error: "Выплата не найдена" });
      }

      db.delete(payments)
        .where(and(eq(payments.id, Number(paymentId)), eq(payments.orderId, Number(orderId))))
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
router.get(
  "/:id/history",
  authenticate,
  requirePermission("orders:detail"),
  async (req: AuthRequest, res) => {
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
  },
);

export default router;
