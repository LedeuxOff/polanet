import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db } from '../db/index.js'
import { users, roles } from '../db/schema.js'
import { generateToken, authenticate, type AuthRequest } from '../middleware/auth.js'
import { loginSchema, registerSchema } from '../middleware/validators.js'
import { eq } from 'drizzle-orm'

const router = Router()

// Вход
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get()

    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)

    if (!isValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' })
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
    })

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        lastName: user.lastName,
        firstName: user.firstName,
        middleName: user.middleName,
        roleId: user.roleId,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ошибка валидации', details: error })
    }
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Регистрация
router.post('/register', async (req, res) => {
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
      .where(eq(users.id, result.lastInsertRowid))
      .get()

    const token = generateToken({
      id: newUser!.id,
      email: newUser!.email,
      roleId: newUser!.roleId,
    })

    res.status(201).json({
      token,
      user: {
        id: newUser!.id,
        email: newUser!.email,
        lastName: newUser!.lastName,
        firstName: newUser!.firstName,
        middleName: newUser!.middleName,
        roleId: newUser!.roleId,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ошибка валидации', details: error })
    }
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Получить текущего пользователя
router.get('/me', authenticate, (req: AuthRequest, res) => {
  try {
    const user = db
      .select({
        id: users.id,
        email: users.email,
        lastName: users.lastName,
        firstName: users.firstName,
        middleName: users.middleName,
        birthDate: users.birthDate,
        phone: users.phone,
        roleId: users.roleId,
      })
      .from(users)
      .where(eq(users.id, req.userId!))
      .get()

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Выход (на клиенте просто удаляем токен)
router.post('/logout', authenticate, (req: AuthRequest, res) => {
  res.json({ message: 'Выход выполнен успешно' })
})

export default router
