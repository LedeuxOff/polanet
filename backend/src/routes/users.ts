import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db } from '../db/index.js'
import { users, roles } from '../db/schema.js'
import { authenticate, type AuthRequest } from '../middleware/auth.js'
import { registerSchema, updateUserSchema } from '../middleware/validators.js'
import { eq, and } from 'drizzle-orm'

const router = Router()

// Получить всех пользователей (с ролью)
router.get('/', authenticate, (req: AuthRequest, res) => {
  try {
    const allUsers = db
      .select({
        id: users.id,
        lastName: users.lastName,
        firstName: users.firstName,
        middleName: users.middleName,
        birthDate: users.birthDate,
        email: users.email,
        phone: users.phone,
        roleId: users.roleId,
        roleCode: roles.code,
        roleName: roles.name,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .all()

    res.json(allUsers)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Получить пользователя по ID
router.get('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const user = db
      .select({
        id: users.id,
        lastName: users.lastName,
        firstName: users.firstName,
        middleName: users.middleName,
        birthDate: users.birthDate,
        email: users.email,
        phone: users.phone,
        roleId: users.roleId,
        roleCode: roles.code,
        roleName: roles.name,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, Number(req.params.id)))
      .get()

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Создать пользователя
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = registerSchema.parse(req.body)

    const existingUser = db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .get()

    if (existingUser) {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' })
    }

    const passwordHash = await bcrypt.hash(data.password, 10)

    const result = db
      .insert(users)
      .values({
        lastName: data.lastName,
        firstName: data.firstName,
        middleName: data.middleName,
        birthDate: data.birthDate,
        email: data.email,
        phone: data.phone,
        passwordHash,
        roleId: data.roleId,
      })
      .run()

    const newUser = db
      .select()
      .from(users)
      .where(eq(users.id, Number(result.lastInsertRowid)))
      .get()

    res.status(201).json(newUser)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ошибка валидации', details: error })
    }
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Обновить пользователя
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = updateUserSchema.parse(req.body)
    const userId = Number(req.params.id)

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: new Date().toISOString(),
    }

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10)
      delete updateData.password
    }

    db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .run()

    const updatedUser = db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .get()

    res.json(updatedUser)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ошибка валидации', details: error })
    }
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Удалить пользователя
router.delete('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const userId = Number(req.params.id)

    // Нельзя удалить самого себя
    if (userId === req.userId) {
      return res.status(400).json({ error: 'Нельзя удалить самого себя' })
    }

    db.delete(users).where(eq(users.id, userId)).run()

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

export default router
