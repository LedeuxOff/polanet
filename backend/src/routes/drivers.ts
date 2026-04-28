import { Router } from 'express'
import { db } from '../db/index.js'
import { drivers, transportCards, transportCardExpenses } from '../db/schema.js'
import { authenticate, type AuthRequest } from '../middleware/auth.js'
import { createDriverSchema, updateDriverSchema } from '../middleware/validators.js'
import { eq } from 'drizzle-orm'

const router = Router()

// Получить всех водителей
router.get('/', authenticate, (req: AuthRequest, res) => {
  try {
    const allDrivers = db.select().from(drivers).all()
    res.json(allDrivers)
  } catch (error) {
    console.error('Error getting drivers:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Получить водителя по ID
router.get('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const driver = db
      .select()
      .from(drivers)
      .where(eq(drivers.id, Number(req.params.id)))
      .get()

    if (!driver) {
      return res.status(404).json({ error: 'Водитель не найден' })
    }

    // Получаем транспортную карту если есть
    const transportCard = db.select().from(transportCards).where(eq(transportCards.driverId, driver.id)).get()

    // Если карта есть, получаем расходы
    if (transportCard) {
      const expenses = db.select().from(transportCardExpenses).where(eq(transportCardExpenses.cardId, transportCard.id)).all()
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
      
      res.json({
        ...driver,
        transportCard: {
          ...transportCard,
          expenses,
          totalExpenses,
        },
      })
    } else {
      res.json({
        ...driver,
        transportCard: null,
      })
    }
  } catch (error) {
    console.error('Error getting driver:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Создать водителя
router.post('/', authenticate, (req: AuthRequest, res) => {
  try {
    const data = createDriverSchema.parse(req.body)

    const result = db
      .insert(drivers)
      .values(data)
      .run()

    const newDriver = db
      .select()
      .from(drivers)
      .where(eq(drivers.id, Number(result.lastInsertRowid)))
      .get()

    res.status(201).json(newDriver)
  } catch (error) {
    console.error('Error creating driver:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ошибка валидации', details: error })
    }
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Обновить водителя
router.put('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const data = updateDriverSchema.parse(req.body)
    const driverId = Number(req.params.id)

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: new Date().toISOString(),
    }

    db.update(drivers)
      .set(updateData)
      .where(eq(drivers.id, driverId))
      .run()

    const updatedDriver = db
      .select()
      .from(drivers)
      .where(eq(drivers.id, driverId))
      .get()

    res.json(updatedDriver)
  } catch (error) {
    console.error('Error updating driver:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ошибка валидации', details: error })
    }
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Удалить водителя
router.delete('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const driverId = Number(req.params.id)

    db.delete(drivers).where(eq(drivers.id, driverId)).run()

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting driver:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

export default router
