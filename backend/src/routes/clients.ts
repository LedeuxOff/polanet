import { Router } from 'express'
import { db } from '../db/index.js'
import { clients } from '../db/schema.js'
import { authenticate, type AuthRequest } from '../middleware/auth.js'
import { createClientSchema, updateClientSchema } from '../middleware/validators.js'
import { eq } from 'drizzle-orm'

const router = Router()

// Получить всех клиентов
router.get('/', authenticate, (req: AuthRequest, res) => {
  try {
    const allClients = db.select().from(clients).all()
    res.json(allClients)
  } catch (error) {
    console.error('Error getting clients:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Получить клиента по ID
router.get('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const client = db
      .select()
      .from(clients)
      .where(eq(clients.id, Number(req.params.id)))
      .get()

    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден' })
    }

    res.json(client)
  } catch (error) {
    console.error('Error getting client:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Создать клиента
router.post('/', authenticate, (req: AuthRequest, res) => {
  try {
    const data = createClientSchema.parse(req.body)

    const result = db
      .insert(clients)
      .values(data)
      .run()

    const newClient = db
      .select()
      .from(clients)
      .where(eq(clients.id, Number(result.lastInsertRowid)))
      .get()

    res.status(201).json(newClient)
  } catch (error) {
    console.error('Error creating client:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ошибка валидации', details: error })
    }
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Обновить клиента
router.put('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const data = updateClientSchema.parse(req.body)
    const clientId = Number(req.params.id)

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: new Date().toISOString(),
    }

    db.update(clients)
      .set(updateData)
      .where(eq(clients.id, clientId))
      .run()

    const updatedClient = db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .get()

    res.json(updatedClient)
  } catch (error) {
    console.error('Error updating client:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ошибка валидации', details: error })
    }
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Удалить клиента
router.delete('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const clientId = Number(req.params.id)

    db.delete(clients).where(eq(clients.id, clientId)).run()

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting client:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

export default router
