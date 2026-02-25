import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(1, 'Пароль обязателен'),
})

export const registerSchema = z.object({
  lastName: z.string().min(1, 'Фамилия обязательна'),
  firstName: z.string().min(1, 'Имя обязательно'),
  middleName: z.string().optional(),
  birthDate: z.string().optional(),
  email: z.string().email('Неверный формат email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
  roleId: z.number().int().positive('Роль обязательна'),
})

export const updateUserSchema = z.object({
  lastName: z.string().min(1, 'Фамилия обязательна').optional(),
  firstName: z.string().min(1, 'Имя обязательно').optional(),
  middleName: z.string().optional(),
  birthDate: z.string().optional(),
  email: z.string().email('Неверный формат email').optional(),
  phone: z.string().optional(),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов').optional(),
  roleId: z.number().int().positive('Роль обязательна').optional(),
})

export const createRoleSchema = z.object({
  code: z.string().min(1, 'Код роли обязателен').max(50),
  name: z.string().min(1, 'Название роли обязательно').max(100),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateRoleInput = z.infer<typeof createRoleSchema>
