import z from "zod"

export const driverSchema = z.object({
  lastName: z.string().min(1, 'Фамилия обязательна').optional(),
  firstName: z.string().min(1, 'Имя обязательно').optional(),
  middleName: z.string().optional(),
  phone: z.string().optional(),
})

export type DriverForm = z.infer<typeof driverSchema>