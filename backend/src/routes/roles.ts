import { Router } from 'express'
import { db } from '../db/index.js'
import { roles } from '../db/schema.js'
import { authenticate } from '../middleware/auth.js'
import { createRoleSchema } from '../middleware/validators.js'
import { eq } from 'drizzle-orm'

const router = Router()

// Получить все роли
router.get('/', authenticate, (req, res) => {
  try {
    const allRoles = db.select().from(roles).all()
    res.json(allRoles)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Создать роль
router.post('/', authenticate, (req, res) => {
  try {
    const data = createRoleSchema.parse(req.body)

    const existingRole = db
      .select()
      .from(roles)
      .where(eq(roles.code, data.code))
      .get()

    if (existingRole) {
      return res.status(409).json({ error: 'Роль с таким кодом уже существует' })
    }

    const result = db.insert(roles).values(data).run()

    const newRole = db
      .select()
      .from(roles)
      .where(eq(roles.id, result.lastInsertRowid))
      .get()

    res.status(201).json(newRole)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ошибка валидации', details: error })
    }
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

export default router
