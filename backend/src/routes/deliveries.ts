import { Router } from "express";
import { db } from "../db/index.js";
import { deliveries, drivers, cars, orders, orderHistory, incomes } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import {
  createDeliverySchema,
  updateDeliverySchema,
  validateOrderStatusTransition,
  orderStatusTransitions,
} from "../middleware/validators.js";
import { eq, desc, and } from "drizzle-orm";

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

// Получить все доставки для заявки
router.get("/order/:orderId", authenticate, (req: AuthRequest, res) => {
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
        status: deliveries.status,
        incomeId: deliveries.incomeId,
        createdAt: deliveries.createdAt,
        updatedAt: deliveries.updatedAt,
      })
      .from(deliveries)
      .where(eq(deliveries.orderId, orderId))
      .orderBy(desc(deliveries.createdAt))
      .all();

    // Для каждой доставки получаем водителя, автомобиль и доход
    const deliveriesWithDetails = allDeliveries.map((delivery: any) => {
      const driver = db.select().from(drivers).where(eq(drivers.id, delivery.driverId)).get();
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
});

// Получить доставку по ID
router.get("/:id", authenticate, (req: AuthRequest, res) => {
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

    // Получаем водителя, автомобиль и доход
    const driver = db.select().from(drivers).where(eq(drivers.id, delivery.driverId)).get();
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
});

// Создать доставку
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const data = createDeliverySchema.parse(req.body);
    const userId = req.userId!;
    const now = new Date().toISOString();

    // Проверяем существование заявки
    const order = db.select().from(orders).where(eq(orders.id, data.orderId)).limit(1).get();

    if (!order) {
      return res.status(404).json({ error: "Заявка не найдена" });
    }

    // Создаем доставку со статусом "в процессе"
    const result = db
      .insert(deliveries)
      .values({
        ...data,
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
    const incomeResult = db
      .insert(incomes)
      .values({
        incomeType: "delivery_payment",
        paymentMethod: data.paymentMethod,
        isPaid: data.isPaid,
        orderId: data.orderId,
        deliveryId: Number(result.lastInsertRowid),
        amount: data.amount,
        paymentDate: now.split("T")[0],
        createdAt: now,
        updatedAt: now,
      })
      .run();

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

    // Получаем водителя, автомобиль и доход для ответа
    const driver = db
      .select()
      .from(drivers)
      .where(eq(drivers.id, Number(result.lastInsertRowid)))
      .get();

    // Получаем доставку заново для получения driverId
    const createdDelivery = db
      .select()
      .from(deliveries)
      .where(eq(deliveries.id, Number(result.lastInsertRowid)))
      .get();

    const driverData = db
      .select()
      .from(drivers)
      .where(eq(drivers.id, createdDelivery!.driverId))
      .get();
    const carData = db.select().from(cars).where(eq(cars.id, createdDelivery!.carId)).get();
    const incomeData = db
      .select()
      .from(incomes)
      .where(eq(incomes.id, Number(incomeResult.lastInsertRowid)))
      .get();

    res.status(201).json({
      ...createdDelivery,
      driver: driverData,
      car: carData,
      income: incomeData,
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
});

// Обновить доставку
router.put("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const data = updateDeliverySchema.parse(req.body);
    const deliveryId = Number(req.params.id);
    const userId = req.userId!;
    const now = new Date().toISOString();

    // Получаем текущую доставку
    const currentDelivery = db.select().from(deliveries).where(eq(deliveries.id, deliveryId)).get();

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
    const { amount, isPaid, ...deliveryUpdateData } = updateData as any;

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

    const updatedDelivery = db.select().from(deliveries).where(eq(deliveries.id, deliveryId)).get();

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
});

// Удалить доставку
router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
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
});

// Завершить доставку
router.post("/:id/complete", authenticate, async (req: AuthRequest, res) => {
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

    const updatedDelivery = db.select().from(deliveries).where(eq(deliveries.id, deliveryId)).get();

    res.json(updatedDelivery);
  } catch (error) {
    console.error("Error completing delivery:", error);
    res.status(500).json({
      error: "Ошибка сервера",
      details: error instanceof Error ? error.message : error,
    });
  }
});

export default router;
