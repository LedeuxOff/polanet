import { Router } from 'express'
import { db } from '../db/index.js'
import { transportCards, transportCardExpenses, transportCardHistory, drivers, users } from '../db/schema.js'
import { authenticate, type AuthRequest } from '../middleware/auth.js'
import { createTransportCardSchema, updateTransportCardSchema, createTransportCardExpenseSchema } from '../middleware/validators.js'
import { eq, desc } from 'drizzle-orm'

const router = Router()

// Вспомогательная функция для записи в историю
async function logHistory(cardId: number, userId: number, action: string, fieldName?: string, oldValue?: string, newValue?: string) {
  db.insert(transportCardHistory).values({
    cardId,
    userId,
    action,
    fieldName,
    oldValue,
    newValue,
    createdAt: new Date().toISOString(),
  }).run()
}

// Получить все карты
router.get('/', authenticate, (req: AuthRequest, res) => {
  try {
    const allCards = db.select().from(transportCards).orderBy(desc(transportCards.createdAt)).all()
    
    // Для каждой карты получаем водителя и расходы
    const cardsWithDetails = allCards.map(card => {
      const driver = card.driverId 
        ? db.select().from(drivers).where(eq(drivers.id, card.driverId)).get()
        : null
      
      const expenses = db.select().from(transportCardExpenses).where(eq(transportCardExpenses.cardId, card.id)).all()
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
      
      return {
        ...card,
        driver,
        expenses,
        totalExpenses,
      }
    })
    
    res.json(cardsWithDetails)
  } catch (error) {
    console.error('Error getting transport cards:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Получить карту по ID
router.get('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const card = db
      .select()
      .from(transportCards)
      .where(eq(transportCards.id, Number(req.params.id)))
      .get()

    if (!card) {
      return res.status(404).json({ error: 'Транспортная карта не найдена' })
    }

    // Получаем водителя
    const driver = card.driverId 
      ? db.select().from(drivers).where(eq(drivers.id, card.driverId)).get()
      : null

    // Получаем расходы
    const expenses = db.select().from(transportCardExpenses).where(eq(transportCardExpenses.cardId, card.id)).all()
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

    // Получаем историю
    const history = db
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
      .where(eq(transportCardHistory.cardId, card.id))
      .orderBy(desc(transportCardHistory.createdAt))
      .all()

    res.json({
      ...card,
      driver,
      expenses,
      totalExpenses,
      history,
    })
  } catch (error) {
    console.error('Error getting transport card:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Создать карту
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = createTransportCardSchema.parse(req.body)
    const userId = req.userId!
    const now = new Date().toISOString()

    // Проверка на дубликат номера карты
    const existingCard = db
      .select()
      .from(transportCards)
      .where(eq(transportCards.cardNumber, data.cardNumber))
      .get()

    if (existingCard) {
      return res.status(409).json({ error: 'Карта с таким номером уже существует' })
    }

    const result = db
      .insert(transportCards)
      .values({
        ...data,
        createdAt: now,
        updatedAt: now,
      })
      .run()

    const newCard = db
      .select()
      .from(transportCards)
      .where(eq(transportCards.id, Number(result.lastInsertRowid)))
      .get()

    // Запись в историю
    await logHistory(newCard!.id, userId, 'created')

    res.status(201).json(newCard)
  } catch (error) {
    console.error('Error creating transport card:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ошибка валидации', details: error })
    }
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Обновить карту
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = updateTransportCardSchema.parse(req.body)
    const cardId = Number(req.params.id)
    const userId = req.userId!
    const now = new Date().toISOString()

    // Получаем текущую карту для сравнения
    const currentCard = db
      .select()
      .from(transportCards)
      .where(eq(transportCards.id, cardId))
      .get()

    if (!currentCard) {
      return res.status(404).json({ error: 'Транспортная карта не найдена' })
    }

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: now,
    }

    db.update(transportCards)
      .set(updateData)
      .where(eq(transportCards.id, cardId))
      .run()

    // Запись изменений в историю
    if (data.cardNumber && data.cardNumber !== currentCard.cardNumber) {
      await logHistory(
        cardId,
        userId,
        'updated',
        'cardNumber',
        currentCard.cardNumber,
        data.cardNumber
      )
    }

    if (data.driverId !== undefined && data.driverId !== currentCard.driverId) {
      const action = data.driverId ? 'driver_assigned' : 'driver_unassigned'
      const oldValue = currentCard.driverId ? `Driver ${currentCard.driverId}` : 'None'
      const newValue = data.driverId ? `Driver ${data.driverId}` : 'None'
      
      await logHistory(cardId, userId, action, 'driverId', oldValue, newValue)
    }

    const updatedCard = db
      .select()
      .from(transportCards)
      .where(eq(transportCards.id, cardId))
      .get()

    res.json(updatedCard)
  } catch (error) {
    console.error('Error updating transport card:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ошибка валидации', details: error })
    }
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Удалить карту
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const cardId = Number(req.params.id)
    const userId = req.userId!

    const card = db
      .select()
      .from(transportCards)
      .where(eq(transportCards.id, cardId))
      .get()

    if (!card) {
      return res.status(404).json({ error: 'Транспортная карта не найдена' })
    }

    // Запись в историю перед удалением
    await logHistory(cardId, userId, 'deleted')

    db.delete(transportCards).where(eq(transportCards.id, cardId)).run()

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting transport card:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Добавить расход
router.post('/:id/expenses', authenticate, async (req: AuthRequest, res) => {
  try {
    const cardId = Number(req.params.id)
    const userId = req.userId!
    const data = createTransportCardExpenseSchema.parse({ ...req.body, cardId })
    const now = new Date().toISOString()

    // Проверяем существование карты
    const card = db
      .select()
      .from(transportCards)
      .where(eq(transportCards.id, cardId))
      .get()

    if (!card) {
      return res.status(404).json({ error: 'Транспортная карта не найдена' })
    }

    const result = db
      .insert(transportCardExpenses)
      .values({
        cardId,
        amount: data.amount,
        paymentDate: data.paymentDate,
        createdAt: now,
      })
      .run()

    const newExpense = db
      .select()
      .from(transportCardExpenses)
      .where(eq(transportCardExpenses.id, Number(result.lastInsertRowid)))
      .get()

    // Запись в историю
    await logHistory(
      cardId,
      userId,
      'expense_added',
      'expense',
      undefined,
      `Расход ${data.amount} руб. от ${data.paymentDate}`
    )

    res.status(201).json(newExpense)
  } catch (error) {
    console.error('Error adding expense:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ошибка валидации', details: error })
    }
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Удалить расход
router.delete('/:cardId/expenses/:expenseId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { cardId, expenseId } = req.params
    const userId = req.userId!

    const expense = db
      .select()
      .from(transportCardExpenses)
      .where(eq(transportCardExpenses.id, Number(expenseId)))
      .get()

    if (!expense) {
      return res.status(404).json({ error: 'Расход не найден' })
    }

    db.delete(transportCardExpenses)
      .where(eq(transportCardExpenses.id, Number(expenseId)))
      .run()

    // Запись в историю
    await logHistory(
      Number(cardId),
      userId,
      'expense_removed',
      'expense',
      `Расход ${expense.amount} руб. от ${expense.paymentDate}`,
      undefined
    )

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting expense:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

export default router
