import { Router } from "express";
import { db, sqlite } from "../db/index.js";
import {
  deliveries,
  users,
  cars,
  orders,
  orderHistory,
  incomes,
  clients,
  recipientHistory,
  permissions,
  rolePermissions,
} from "../db/schema.js";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

// Create table aliases for self-joins
const usersChangedBy = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lastName: text("last_name").notNull(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
});

const usersRecipient = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lastName: text("last_name").notNull(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
});

const usersOldRecipient = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lastName: text("last_name").notNull(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
});

import { requirePermission } from "../middleware/permissions.js";
import {
  createDeliverySchema,
  updateDeliverySchema,
  validateOrderStatusTransition,
  orderStatusTransitions,
} from "../middleware/validators.js";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { sendClientNotification, sendDriverNotification } from "../services/telegram-service.js";

const router = Router();

// Вспомогательная функция для записи в историю заявки
async function logOrderHistory(
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

// Получить все доставки с фильтрацией по дате (для календаря)
router.get(
  "/calendar",
  authenticate,
  requirePermission("deliveries:list"),
  (req: AuthRequest, res) => {
    try {
      const { startDate, endDate } = req.query;

      // Если даты не переданы, используем текущую неделю
      let startDt: string;
      let endDt: string;

      if (startDate && endDate) {
        startDt = startDate as string;
        endDt = endDate as string;
      } else {
        // Текущая неделя (понедельник - воскресенье)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(now);
        monday.setDate(now.getDate() + mondayOffset);
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        startDt = monday.toISOString().split("T")[0];
        endDt = sunday.toISOString().split("T")[0];
      }

      // Получаем все доставки с фильтрацией по дате
      const allDeliveries = db
        .select({
          id: deliveries.id,
          orderId: deliveries.orderId,
          driverId: deliveries.driverId,
          carId: deliveries.carId,
          dateTime: deliveries.dateTime,
          volume: deliveries.volume,
          comment: deliveries.comment,
          paymentMethod: deliveries.paymentMethod,
          isPaymentBeforeUnloading: deliveries.isPaymentBeforeUnloading,
          notifyClient: deliveries.notifyClient,
          notifyDriver: deliveries.notifyDriver,
          status: deliveries.status,
          incomeId: deliveries.incomeId,
          createdAt: deliveries.createdAt,
          updatedAt: deliveries.updatedAt,
        })
        .from(deliveries)
        .where(
          and(gte(deliveries.dateTime, startDt), lte(deliveries.dateTime, endDt + " 23:59:59")),
        )
        .orderBy(deliveries.dateTime)
        .all();

      // Для каждой доставки получаем сотрудника (водителя), автомобиль, заказ и клиента
      const deliveriesWithDetails = allDeliveries.map((delivery: any) => {
        const driver = db.select().from(users).where(eq(users.id, delivery.driverId)).get();
        const car = db.select().from(cars).where(eq(cars.id, delivery.carId)).get();
        const order = db.select().from(orders).where(eq(orders.id, delivery.orderId)).get();

        let client = null;
        if (order?.clientId) {
          client = db.select().from(clients).where(eq(clients.id, order.clientId)).get();
        }

        let income = null;
        if (delivery.incomeId) {
          income = db.select().from(incomes).where(eq(incomes.id, delivery.incomeId)).get();
        }

        return {
          ...delivery,
          driver,
          car,
          order,
          client,
          income,
        };
      });

      res.json(deliveriesWithDetails);
    } catch (error) {
      console.error("Error getting calendar deliveries:", error);
      res.status(500).json({
        error: "Ошибка сервера",
        details: error instanceof Error ? error.message : error,
      });
    }
  },
);

// Получить все доставки для заявки
router.get(
  "/order/:orderId",
  authenticate,
  requirePermission("deliveries:list"),
  (req: AuthRequest, res) => {
    try {
      const orderId = Number(req.params.orderId);
      const allDeliveries = db
        .select({
          id: deliveries.id,
          orderId: deliveries.orderId,
          driverId: deliveries.driverId,
          carId: deliveries.carId,
          dateTime: deliveries.dateTime,
          volume: deliveries.volume,
          comment: deliveries.comment,
          paymentMethod: deliveries.paymentMethod,
          isPaymentBeforeUnloading: deliveries.isPaymentBeforeUnloading,
          notifyClient: deliveries.notifyClient,
          notifyDriver: deliveries.notifyDriver,
          status: deliveries.status,
          incomeId: deliveries.incomeId,
          createdAt: deliveries.createdAt,
          updatedAt: deliveries.updatedAt,
        })
        .from(deliveries)
        .where(eq(deliveries.orderId, orderId))
        .orderBy(desc(deliveries.createdAt))
        .all();

      // Для каждой доставки получаем сотрудника (водителя), автомобиль и доход
      const deliveriesWithDetails = allDeliveries.map((delivery: any) => {
        const driver = db.select().from(users).where(eq(users.id, delivery.driverId)).get();
        const car = db.select().from(cars).where(eq(cars.id, delivery.carId)).get();
        let income = null;
        if (delivery.incomeId) {
          income = db.select().from(incomes).where(eq(incomes.id, delivery.incomeId)).get();
        }

        return {
          ...delivery,
          driver,
          car,
          income,
        };
      });

      res.json(deliveriesWithDetails);
    } catch (error) {
      console.error("Error getting deliveries:", error);
      res.status(500).json({
        error: "Ошибка сервера",
        details: error instanceof Error ? error.message : error,
      });
    }
  },
);

// Получить доставку по ID
router.get(
  "/:id",
  authenticate,
  requirePermission("deliveries:detail"),
  (req: AuthRequest, res) => {
    try {
      const delivery = db
        .select({
          id: deliveries.id,
          orderId: deliveries.orderId,
          driverId: deliveries.driverId,
          carId: deliveries.carId,
          dateTime: deliveries.dateTime,
          volume: deliveries.volume,
          comment: deliveries.comment,
          paymentMethod: deliveries.paymentMethod,
          isPaymentBeforeUnloading: deliveries.isPaymentBeforeUnloading,
          notifyClient: deliveries.notifyClient,
          notifyDriver: deliveries.notifyDriver,
          status: deliveries.status,
          incomeId: deliveries.incomeId,
          createdAt: deliveries.createdAt,
          updatedAt: deliveries.updatedAt,
        })
        .from(deliveries)
        .where(eq(deliveries.id, Number(req.params.id)))
        .get();

      if (!delivery) {
        return res.status(404).json({ error: "Доставка не найдена" });
      }

      // Получаем сотрудника (водителя), автомобиль и доход
      const driver = db.select().from(users).where(eq(users.id, delivery.driverId)).get();
      const car = db.select().from(cars).where(eq(cars.id, delivery.carId)).get();
      let income = null;
      if (delivery.incomeId) {
        income = db.select().from(incomes).where(eq(incomes.id, delivery.incomeId)).get();
      }

      res.json({
        ...delivery,
        driver,
        car,
        income,
      });
    } catch (error) {
      console.error("Error getting delivery:", error);
      res.status(500).json({
        error: "Ошибка сервера",
        details: error instanceof Error ? error.message : error,
      });
    }
  },
);

// Создать доставку
router.post(
  "/",
  authenticate,
  requirePermission("deliveries:create"),
  async (req: AuthRequest, res) => {
    try {
      const data = createDeliverySchema.parse(req.body);
      const userId = req.userId!;
      const now = new Date().toISOString();

      // Проверяем существование заявки
      const order = db.select().from(orders).where(eq(orders.id, data.orderId)).limit(1).get();

      if (!order) {
        return res.status(404).json({ error: "Заявка не найдена" });
      }

      // Получаем информацию о клиенте для уведомлений
      const client = order.clientId
        ? db.select().from(clients).where(eq(clients.id, order.clientId)).get()
        : null;

      // Получаем информацию о сотруднике (водителе)
      const driverData = db.select().from(users).where(eq(users.id, data.driverId)).get();

      // Получаем информацию об автомобиле
      const carData = db.select().from(cars).where(eq(cars.id, data.carId)).get();

      // Создаем доставку со статусом "в процессе"
      const result = db
        .insert(deliveries)
        .values({
          ...data,
          notifyClient: data.notifyClient || false,
          notifyDriver: data.notifyDriver || false,
          status: "in_progress",
          incomeId: null,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      const newDelivery = db
        .select()
        .from(deliveries)
        .where(eq(deliveries.id, Number(result.lastInsertRowid)))
        .get();

      // Создаем связанный доход с указанной суммой и статусом оплаты
      const incomeData: any = {
        incomeType: "delivery_payment",
        paymentMethod: data.paymentMethod,
        isPaid: data.isPaid,
        orderId: data.orderId,
        deliveryId: Number(result.lastInsertRowid),
        amount: data.amount,
        paymentDate: now.split("T")[0],
        createdAt: now,
        updatedAt: now,
      };

      // Добавляем поля получателя, если они есть
      if (data.recipientId) {
        incomeData.recipientId = data.recipientId;
      }

      const incomeResult = db.insert(incomes).values(incomeData).run();

      // Обновляем доставку, привязывая доход
      db.update(deliveries)
        .set({ incomeId: Number(incomeResult.lastInsertRowid), updatedAt: now })
        .where(eq(deliveries.id, Number(result.lastInsertRowid)))
        .run();

      // Обновляем статус заявки на "in_progress"
      const currentOrder = db.select().from(orders).where(eq(orders.id, data.orderId)).get();

      if (currentOrder && currentOrder.status !== "in_progress") {
        // Проверяем, допустим ли переход в статус "in_progress"
        const isValid = validateOrderStatusTransition(currentOrder.status, "in_progress");
        if (!isValid) {
          const allowedTransitions = orderStatusTransitions[currentOrder.status] || [];
          return res.status(400).json({
            error: "Недопустимый переход статуса",
            details: `Из статуса "${currentOrder.status}" нельзя перейти в "in_progress". Допустимые переходы: ${allowedTransitions.join(", ") || "никакой (конечный статус)"}`,
          });
        }

        db.update(orders)
          .set({ status: "in_progress", updatedAt: now })
          .where(eq(orders.id, data.orderId))
          .run();

        // Запись в историю изменения статуса
        await logOrderHistory(
          data.orderId,
          userId,
          "status_changed",
          "status",
          currentOrder.status,
          "in_progress",
        );
      }

      // Запись в историю заявки
      await logOrderHistory(
        data.orderId,
        userId,
        "delivery_added",
        "delivery",
        undefined,
        `Доставка создана (статус: в процессе)`,
      );

      // Отправляем Telegram уведомления если включено
      if (process.env.TELEGRAM_CHAT_ID && driverData) {
        try {
          if (data.notifyClient) {
            const driverFio =
              `${driverData.lastName} ${driverData.firstName} ${driverData.middleName || ""}`.trim();
            // Пытаемся отправить клиенту по его telegramChatId, если нет - на общий чат
            const clientUser = db
              .select({ telegramChatId: users.telegramChatId })
              .from(users)
              .where(eq(users.email, client?.email || ""))
              .get();

            const targetChatId = clientUser?.telegramChatId || process.env.TELEGRAM_CHAT_ID!;
            await sendClientNotification(
              targetChatId,
              data.dateTime,
              driverFio,
              driverData.phone || "",
            );
          }
          if (data.notifyDriver) {
            const driverFio =
              `${driverData.lastName} ${driverData.firstName} ${driverData.middleName || ""}`.trim();
            // Пытаемся отправить водителю по его telegramChatId, если нет - на общий чат
            const targetChatId = driverData.telegramChatId || process.env.TELEGRAM_CHAT_ID!;

            // Получаем адрес и контактные данные из заявки
            const orderAddress = order.address || "";
            const orderReceiverLastName = (order as any).receiverLastName || "";
            const orderReceiverFirstName = (order as any).receiverFirstName || "";
            const contactPersonFio = `${orderReceiverLastName} ${orderReceiverFirstName}`.trim();
            const orderReceiverPhone = (order as any).receiverPhone || "";
            await sendDriverNotification(
              targetChatId,
              data.dateTime,
              orderAddress,
              contactPersonFio,
              orderReceiverPhone,
              carData?.brand || "",
              carData?.licensePlate || "",
            );
          }
        } catch (error) {
          console.error("Ошибка отправки Telegram уведомления о доставке:", error);
        }
      }

      // Получаем доставку заново для ответа
      const createdDelivery = db
        .select()
        .from(deliveries)
        .where(eq(deliveries.id, Number(result.lastInsertRowid)))
        .get();

      res.status(201).json({
        ...createdDelivery,
        driver: driverData,
        car: carData,
        income: incomeResult,
      });
    } catch (error) {
      console.error("Error creating delivery:", error);
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

// Обновить доставку
router.put(
  "/:id",
  authenticate,
  requirePermission("deliveries:update"),
  async (req: AuthRequest, res) => {
    try {
      const data = updateDeliverySchema.parse(req.body);
      const deliveryId = Number(req.params.id);
      const userId = req.userId!;
      const now = new Date().toISOString();

      // Получаем текущую доставку
      const currentDelivery = db
        .select()
        .from(deliveries)
        .where(eq(deliveries.id, deliveryId))
        .get();

      if (!currentDelivery) {
        return res.status(404).json({ error: "Доставка не найдена" });
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

      // Удаляем amount и isPaid из updateData - они обновляются в income
      const { amount, isPaid, recipientId, ...deliveryUpdateData } = updateData as any;

      db.update(deliveries).set(deliveryUpdateData).where(eq(deliveries.id, deliveryId)).run();

      // Если изменены amount или isPaid, обновляем связанный доход
      if (amount !== undefined && currentDelivery.incomeId) {
        db.update(incomes)
          .set({ amount, updatedAt: now })
          .where(eq(incomes.id, currentDelivery.incomeId))
          .run();
      }

      if (isPaid !== undefined && currentDelivery.incomeId) {
        db.update(incomes)
          .set({ isPaid, updatedAt: now })
          .where(eq(incomes.id, currentDelivery.incomeId))
          .run();
      }

      // Обновляем recipientId в связанном income и логируем изменения
      if (recipientId !== undefined && currentDelivery.incomeId) {
        // СНАЧАЛА читаем текущие (старые) значения получателя из income
        const oldIncome = db
          .select()
          .from(incomes)
          .where(eq(incomes.id, currentDelivery.incomeId))
          .get();

        const incomeUpdate: Record<string, unknown> = { updatedAt: now };
        if (recipientId !== undefined) incomeUpdate.recipientId = recipientId;
        db.update(incomes).set(incomeUpdate).where(eq(incomes.id, currentDelivery.incomeId)).run();

        // Проверяем, была ли уже запись в истории для этой доставки
        const existingHistory = sqlite
          .prepare("SELECT COUNT(*) as count FROM recipient_history WHERE delivery_id = ?")
          .all(deliveryId) as { count: number }[];

        const hasHistory = (existingHistory[0]?.count || 0) > 0;
        const action = hasHistory ? "updated" : "created";

        db.insert(recipientHistory)
          .values({
            deliveryId,
            incomeId: currentDelivery.incomeId,
            userId,
            recipientId: recipientId ?? null,
            oldRecipientId: oldIncome?.recipientId ?? null,
            action,
            comment: hasHistory
              ? `Изменен получатель. ID: ${recipientId}`
              : `Получатель назначен. ID: ${recipientId}`,
            createdAt: now,
          })
          .run();
      }
      const updatedDelivery = db
        .select()
        .from(deliveries)
        .where(eq(deliveries.id, deliveryId))
        .get();

      res.json(updatedDelivery);
    } catch (error) {
      console.error("Error updating delivery:", error);
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

// Удалить доставку
router.delete(
  "/:id",
  authenticate,
  requirePermission("deliveries:delete"),
  async (req: AuthRequest, res) => {
    try {
      const deliveryId = Number(req.params.id);
      const userId = req.userId!;
      const now = new Date().toISOString();

      const delivery = db.select().from(deliveries).where(eq(deliveries.id, deliveryId)).get();

      if (!delivery) {
        return res.status(404).json({ error: "Доставка не найдена" });
      }

      // Удаляем связанный доход
      if (delivery.incomeId) {
        db.delete(incomes).where(eq(incomes.id, delivery.incomeId)).run();
      }

      // Запись в историю перед удалением
      await logOrderHistory(
        delivery.orderId,
        userId,
        "delivery_deleted",
        "delivery",
        undefined,
        undefined,
      );

      db.delete(deliveries).where(eq(deliveries.id, deliveryId)).run();

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting delivery:", error);
      res.status(500).json({
        error: "Ошибка сервера",
        details: error instanceof Error ? error.message : error,
      });
    }
  },
);

// Завершить доставку
router.post(
  "/:id/complete",
  authenticate,
  requirePermission("deliveries:complete"),
  async (req: AuthRequest, res) => {
    try {
      const deliveryId = Number(req.params.id);
      const userId = req.userId!;
      const now = new Date().toISOString();

      const delivery = db.select().from(deliveries).where(eq(deliveries.id, deliveryId)).get();

      if (!delivery) {
        return res.status(404).json({ error: "Доставка не найдена" });
      }

      if (delivery.status === "completed") {
        return res.status(400).json({ error: "Доставка уже завершена" });
      }

      // Обновляем статус доставки на completed
      db.update(deliveries)
        .set({ status: "completed", updatedAt: now })
        .where(eq(deliveries.id, deliveryId))
        .run();

      // Обновляем связанный доход, устанавливая isPaid = true
      if (delivery.incomeId) {
        db.update(incomes)
          .set({ isPaid: true, updatedAt: now })
          .where(eq(incomes.id, delivery.incomeId))
          .run();

        // Записываем изменение получателя в историю при завершении доставки
        // Только если ещё нет записей в истории (т.е. получатель не был назначен ранее)
        const existingHistory = sqlite
          .prepare("SELECT COUNT(*) as count FROM recipient_history WHERE delivery_id = ?")
          .all(deliveryId) as { count: number }[];

        const hasHistory = (existingHistory[0]?.count || 0) > 0;

        if (!hasHistory) {
          const currentIncome = db
            .select()
            .from(incomes)
            .where(eq(incomes.id, delivery.incomeId))
            .get();

          if (currentIncome && currentIncome.recipientId) {
            db.insert(recipientHistory)
              .values({
                deliveryId,
                incomeId: delivery.incomeId,
                userId,
                recipientId: currentIncome.recipientId,
                oldRecipientId: null,
                action: "created",
                comment: `Получатель назначен при завершении доставки. ID: ${currentIncome.recipientId}`,
                createdAt: now,
              })
              .run();
          }
        }
      }

      // Запись в историю
      await logOrderHistory(
        delivery.orderId,
        userId,
        "delivery_completed",
        "delivery_status",
        "В процессе",
        "Завершена",
      );

      const updatedDelivery = db
        .select()
        .from(deliveries)
        .where(eq(deliveries.id, deliveryId))
        .get();

      res.json(updatedDelivery);
    } catch (error) {
      console.error("Error completing delivery:", error);
      res.status(500).json({
        error: "Ошибка сервера",
        details: error instanceof Error ? error.message : error,
      });
    }
  },
);

// Получить историю изменений получателей для доставки
router.get(
  "/:id/recipient-history",
  authenticate,
  requirePermission("deliveries:list"),
  async (req: AuthRequest, res) => {
    try {
      const deliveryId = parseInt(req.params.id);

      if (isNaN(deliveryId)) {
        return res.status(400).json({ error: "Неверный ID доставки" });
      }

      // Use raw SQL to avoid Drizzle alias issues with multiple joins
      const history = sqlite
        .prepare(
          `
          SELECT
            rh.id,
            rh.delivery_id,
            rh.income_id,
            rh.user_id,
            rh.recipient_id,
            rh.old_recipient_id,
            rh.action,
            rh.comment,
            rh.created_at,
            -- Name of user who made the change
            u_changed.last_name || ' ' || u_changed.first_name || (CASE WHEN u_changed.middle_name IS NOT NULL AND u_changed.middle_name != '' THEN ' ' || u_changed.middle_name ELSE '' END) as changed_by_name,
            -- Recipient name (employee)
            u_emp.last_name || ' ' || u_emp.first_name || (CASE WHEN u_emp.middle_name IS NOT NULL AND u_emp.middle_name != '' THEN ' ' || u_emp.middle_name ELSE '' END) as recipient_emp_name,
            -- Old recipient name (employee)
            u_old_emp.last_name || ' ' || u_old_emp.first_name || (CASE WHEN u_old_emp.middle_name IS NOT NULL AND u_old_emp.middle_name != '' THEN ' ' || u_old_emp.middle_name ELSE '' END) as old_recipient_emp_name
          FROM recipient_history rh
          LEFT JOIN users u_changed ON rh.user_id = u_changed.id
          LEFT JOIN users u_emp ON rh.recipient_id = u_emp.id
          LEFT JOIN users u_old_emp ON rh.old_recipient_id = u_old_emp.id
          WHERE rh.delivery_id = ?
          ORDER BY rh.created_at DESC
        `,
        )
        .all(deliveryId) as any[];

      // Map to plain objects
      const plainHistory = (history || []).map((item: any) => {
        let recipientName = "";
        if (item.recipient_emp_name) {
          recipientName = item.recipient_emp_name.trim();
        }

        let oldRecipientName = "";
        if (item.old_recipient_emp_name) {
          oldRecipientName = item.old_recipient_emp_name.trim();
        }

        return {
          id: Number(item.id),
          deliveryId: Number(item.delivery_id),
          incomeId: item.income_id ? Number(item.income_id) : null,
          userId: Number(item.user_id),
          recipientId: item.recipient_id ? Number(item.recipient_id) : null,
          recipientName: recipientName || "",
          oldRecipientId: item.old_recipient_id ? Number(item.old_recipient_id) : null,
          oldRecipientName: oldRecipientName || "",
          action: item.action,
          comment: item.comment ?? null,
          createdAt: item.created_at,
          changedByName: item.changed_by_name?.trim() || null,
        };
      });

      res.json(plainHistory);
    } catch (error) {
      console.error("Error fetching recipient history:", error);
      res.status(500).json({
        error: "Ошибка сервера",
        details: error instanceof Error ? error.message : error,
      });
    }
  },
);

export default router;
