import { Router } from 'express'
import { db } from '../db/index.js'
import { deliveries, drivers, cars, payments, orderHistory } from '../db/schema.js'
import { authenticate, type AuthRequest } from '../middleware/auth.js'
import { createDeliverySchema, updateDeliverySchema } from '../middleware/validators.js'
import { eq, desc } from 'drizzle-orm'

const router = Router()

// Вспомогательная функция для записи в историю заявки
async function logOrderHistory(orderId: number, userId: number, action: string, fieldName?: string, oldValue?: string, newValue?: string) {
  db.insert(orderHistory).values({
    orderId,
    userId,
    action,
    fieldName,
    oldValue,
    newValue,
    createdAt: new Date().toISOString(),
  }).run()
}

// Получить все доставки для заявки
router.get('/order/:orderId', authenticate, (req: AuthRequest, res) => {
  try {
    const orderId = Number(req.params.orderId)
    const allDeliveries = db.select().from(deliveries).where(eq(deliveries.orderId, orderId)).orderBy(desc(deliveries.createdAt)).all()
    
    // Для каждой доставки получаем водителя и автомобиль
    const deliveriesWithDetails = allDeliveries.map(delivery => {
      const driver = db.select().from(drivers).where(eq(drivers.id, delivery.driverId)).get()
      const car = db.select().from(cars).where(eq(cars.id, delivery.carId)).get()
      
      return {
        ...delivery,
        driver,
        car,
      }
    })
    
    res.json(deliveriesWithDetails)
  } catch (error) {
    console.error('Error getting deliveries:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Получить доставку по ID
router.get('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const delivery = db
      .select()
      .from(deliveries)
      .where(eq(deliveries.id, Number(req.params.id)))
      .get()

    if (!delivery) {
      return res.status(404).json({ error: 'Доставка не найдена' })
    }

    res.json(delivery)
  } catch (error) {
    console.error('Error getting delivery:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Создать доставку
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = createDeliverySchema.parse(req.body)
    const userId = req.userId!
    const now = new Date().toISOString()

    const result = db
      .insert(deliveries)
      .values({
        ...data,
        createdAt: now,
        updatedAt: now,
      })
      .run()

    const newDelivery = db
      .select()
      .from(deliveries)
      .where(eq(deliveries.id, Number(result.lastInsertRowid)))
      .get()

    // Если доставка оплачена, создаем выплату
    if (data.isPaid) {
      db.insert(payments).values({
        orderId: data.orderId,
        amount: data.cost,
        paymentDate: now.split('T')[0],
        createdAt: now,
      }).run()
      
      // Запись в историю заявки
      await logOrderHistory(
        data.orderId,
        userId,
        'delivery_added',
        'delivery',
        undefined,
        `Доставка ${data.cost} руб. (оплачено)`
      )
    } else {
      // Запись в историю заявки
      await logOrderHistory(
        data.orderId,
        userId,
        'delivery_added',
        'delivery',
        undefined,
        `Доставка ${data.cost} руб.`
      )
    }

    res.status(201).json(newDelivery)
  } catch (error) {
    console.error('Error creating delivery:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ошибка валидации', details: error })
    }
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Обновить доставку
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = updateDeliverySchema.parse(req.body)
    const deliveryId = Number(req.params.id)
    const userId = req.userId!
    const now = new Date().toISOString()

    // Получаем текущую доставку
    const currentDelivery = db
      .select()
      .from(deliveries)
      .where(eq(deliveries.id, deliveryId))
      .get()

    if (!currentDelivery) {
      return res.status(404).json({ error: 'Доставка не найдена' })
    }

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: now,
    }

    db.update(deliveries)
      .set(updateData)
      .where(eq(deliveries.id, deliveryId))
      .run()

    // Если изменился статус оплаты
    if (data.isPaid !== undefined && data.isPaid !== currentDelivery.isPaid) {
      if (data.isPaid) {
        // Создаем выплату
        db.insert(payments).values({
          orderId: currentDelivery.orderId,
          amount: currentDelivery.cost,
          paymentDate: now.split('T')[0],
          createdAt: now,
        }).run()
        
        await logOrderHistory(
          currentDelivery.orderId,
          userId,
          'delivery_paid',
          'delivery_status',
          'Не оплачено',
          'Оплачено'
        )
      }
    }

    const updatedDelivery = db
      .select()
      .from(deliveries)
      .where(eq(deliveries.id, deliveryId))
      .get()

    res.json(updatedDelivery)
  } catch (error) {
    console.error('Error updating delivery:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ошибка валидации', details: error })
    }
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Удалить доставку
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const deliveryId = Number(req.params.id)
    const userId = req.userId!
    const now = new Date().toISOString()

    const delivery = db
      .select()
      .from(deliveries)
      .where(eq(deliveries.id, deliveryId))
      .get()

    if (!delivery) {
      return res.status(404).json({ error: 'Доставка не найдена' })
    }

    // Если доставка оплачена, удаляем связанную выплату
    if (delivery.paymentId) {
      db.delete(payments).where(eq(payments.id, delivery.paymentId)).run()
    }

    // Запись в историю перед удалением
    await logOrderHistory(
      delivery.orderId,
      userId,
      'delivery_deleted',
      'delivery',
      `Доставка ${delivery.cost} руб.`,
      undefined
    )

    db.delete(deliveries).where(eq(deliveries.id, deliveryId)).run()

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting delivery:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Отметить доставку как оплаченную
router.post('/:id/pay', authenticate, async (req: AuthRequest, res) => {
  try {
    const deliveryId = Number(req.params.id)
    const userId = req.userId!
    const now = new Date().toISOString()

    const delivery = db
      .select()
      .from(deliveries)
      .where(eq(deliveries.id, deliveryId))
      .get()

    if (!delivery) {
      return res.status(404).json({ error: 'Доставка не найдена' })
    }

    // Обновляем статус оплаты
    db.update(deliveries)
      .set({ isPaid: true, updatedAt: now })
      .where(eq(deliveries.id, deliveryId))
      .run()

    // Создаем выплату
    db.insert(payments).values({
      orderId: delivery.orderId,
      amount: delivery.cost,
      paymentDate: now.split('T')[0],
      createdAt: now,
    }).run()

    // Запись в историю
    await logOrderHistory(
      delivery.orderId,
      userId,
      'delivery_paid',
      'delivery_status',
      'Не оплачено',
      'Оплачено'
    )

    const updatedDelivery = db
      .select()
      .from(deliveries)
      .where(eq(deliveries.id, deliveryId))
      .get()

    res.json(updatedDelivery)
  } catch (error) {
    console.error('Error marking delivery as paid:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

export default router
