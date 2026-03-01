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

export const createCarSchema = z.object({
  brand: z.string().min(1, 'Марка автомобиля обязательна').max(100),
  licensePlate: z.string().min(1, 'Гос номер обязателен').max(20),
})

export const updateCarSchema = z.object({
  brand: z.string().min(1, 'Марка автомобиля обязательна').max(100).optional(),
  licensePlate: z.string().min(1, 'Гос номер обязателен').max(20).optional(),
})

export const createDriverSchema = z.object({
  lastName: z.string().min(1, 'Фамилия обязательна').max(100),
  firstName: z.string().min(1, 'Имя обязательно').max(100),
  middleName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
})

export const updateDriverSchema = z.object({
  lastName: z.string().min(1, 'Фамилия обязательна').max(100).optional(),
  firstName: z.string().min(1, 'Имя обязательно').max(100).optional(),
  middleName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
})

export const createClientSchema = z.object({
  type: z.enum(['individual', 'legal'], {
    errorMap: () => ({ message: 'Тип клиента обязателен' }),
  }),
  // Для физического лица
  lastName: z.string().min(1, 'Фамилия обязательна').max(100).optional().nullable(),
  firstName: z.string().min(1, 'Имя обязательно').max(100).optional().nullable(),
  middleName: z.string().max(100).optional().nullable(),
  // Для юридического лица
  organizationName: z.string().min(1, 'Название организации обязательно').max(200).optional().nullable(),
  // Общие поля
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email('Неверный формат email').optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.type === 'individual') {
    if (!data.lastName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Фамилия обязательна для физического лица',
        path: ['lastName'],
      })
    }
    if (!data.firstName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Имя обязательно для физического лица',
        path: ['firstName'],
      })
    }
  } else if (data.type === 'legal') {
    if (!data.organizationName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Название организации обязательно для юридического лица',
        path: ['organizationName'],
      })
    }
  }
})

export const updateClientSchema = z.object({
  type: z.enum(['individual', 'legal']).optional(),
  lastName: z.string().min(1, 'Фамилия обязательна').max(100).optional(),
  firstName: z.string().min(1, 'Имя обязательно').max(100).optional(),
  middleName: z.string().max(100).optional(),
  organizationName: z.string().min(1, 'Название организации обязательно').max(200).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Неверный формат email').optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type CreateCarInput = z.infer<typeof createCarSchema>
export type UpdateCarInput = z.infer<typeof updateCarSchema>
export type CreateDriverInput = z.infer<typeof createDriverSchema>
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>
export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
