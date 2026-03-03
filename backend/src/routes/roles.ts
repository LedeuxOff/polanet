import { Router } from 'express'
import { db } from '../db/index.js'
import { roles } from '../db/schema.js'
import { authenticate, type AuthRequest } from '../middleware/auth.js'
import { createRoleSchema } from '../middleware/validators.js'
import { eq } from 'drizzle-orm'

const router = Router()

// Получить все роли
router.get('/', authenticate, (req, res) => {
  try {
    const allRoles = db.select().from(roles).all()
    res.json(allRoles)
  } catch (error) {
    console.error('Error getting roles:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Получить роль по ID
router.get('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const role = db
      .select()
      .from(roles)
      .where(eq(roles.id, Number(req.params.id)))
      .get()

    if (!role) {
      return res.status(404).json({ error: 'Роль не найдена' })
    }

    res.json(role)
  } catch (error) {
    console.error('Error getting role:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Создать роль
router.post('/', authenticate, (req: AuthRequest, res) => {
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
      .where(eq(roles.id, Number(result.lastInsertRowid)))
      .get()

    res.status(201).json(newRole)
  } catch (error) {
    console.error('Error creating role:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ошибка валидации', details: error })
    }
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Обновить роль
router.put('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const { code, name } = req.body
    const roleId = Number(req.params.id)

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }
    if (code) updateData.code = code
    if (name) updateData.name = name

    db.update(roles)
      .set(updateData)
      .where(eq(roles.id, roleId))
      .run()

    const updatedRole = db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .get()

    res.json(updatedRole)
  } catch (error) {
    console.error('Error updating role:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

// Удалить роль
router.delete('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const roleId = Number(req.params.id)

    db.delete(roles).where(eq(roles.id, roleId)).run()

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting role:', error)
    res.status(500).json({ error: 'Ошибка сервера', details: error instanceof Error ? error.message : error })
  }
})

export default router
