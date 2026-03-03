import { Router } from 'express'
import { db } from '../db/index.js'
import { cars } from '../db/schema.js'
import { authenticate, type AuthRequest } from '../middleware/auth.js'
import { createCarSchema, updateCarSchema } from '../middleware/validators.js'
import { eq } from 'drizzle-orm'

const router = Router()

// Получить все автомобили
router.get('/', authenticate, (req: AuthRequest, res) => {
  try {
    const allCars = db.select().from(cars).all()
    res.json(allCars)
  } catch (error) {
    console.error('Error getting cars:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Получить автомобиль по ID
router.get('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const car = db
      .select()
      .from(cars)
      .where(eq(cars.id, Number(req.params.id)))
      .get()

    if (!car) {
      return res.status(404).json({ error: 'Автомобиль не найден' })
    }

    res.json(car)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Создать автомобиль
router.post('/', authenticate, (req: AuthRequest, res) => {
  try {
    const data = createCarSchema.parse(req.body)

    const existingCar = db
      .select()
      .from(cars)
      .where(eq(cars.licensePlate, data.licensePlate))
      .get()

    if (existingCar) {
      return res.status(409).json({ error: 'Автомобиль с таким номером уже существует' })
    }

    const result = db
      .insert(cars)
      .values(data)
      .run()

    const newCar = db
      .select()
      .from(cars)
      .where(eq(cars.id, Number(result.lastInsertRowid)))
      .get()

    res.status(201).json(newCar)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ошибка валидации', details: error })
    }
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Обновить автомобиль
router.put('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const data = updateCarSchema.parse(req.body)
    const carId = Number(req.params.id)

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: new Date().toISOString(),
    }

    db.update(cars)
      .set(updateData)
      .where(eq(cars.id, carId))
      .run()

    const updatedCar = db
      .select()
      .from(cars)
      .where(eq(cars.id, carId))
      .get()

    res.json(updatedCar)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ошибка валидации', details: error })
    }
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Удалить автомобиль
router.delete('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const carId = Number(req.params.id)

    db.delete(cars).where(eq(cars.id, carId)).run()

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

export default router
