import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(1, "Пароль обязателен"),
});

export const registerSchema = z.object({
  lastName: z.string().min(1, "Фамилия обязательна"),
  firstName: z.string().min(1, "Имя обязательно"),
  middleName: z.string().optional(),
  birthDate: z.string().optional(),
  email: z.string().email("Неверный формат email"),
  phone: z.string().optional(),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
  roleId: z.number().int().positive("Роль обязательна"),
});

export const updateUserSchema = z.object({
  lastName: z.string().min(1, "Фамилия обязательна").optional(),
  firstName: z.string().min(1, "Имя обязательно").optional(),
  middleName: z.string().optional(),
  birthDate: z.string().optional(),
  email: z.string().email("Неверный формат email").optional(),
  phone: z.string().optional(),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов").optional(),
  roleId: z.number().int().positive("Роль обязательна").optional(),
});

export const createRoleSchema = z.object({
  code: z.string().min(1, "Код роли обязателен").max(50),
  name: z.string().min(1, "Название роли обязательно").max(100),
});

export const createCarSchema = z.object({
  brand: z.string().min(1, "Марка автомобиля обязательна").max(100),
  licensePlate: z.string().min(1, "Гос номер обязателен").max(20),
});

export const updateCarSchema = z.object({
  brand: z.string().min(1, "Марка автомобиля обязательна").max(100).optional(),
  licensePlate: z.string().min(1, "Гос номер обязателен").max(20).optional(),
});

export const createDriverSchema = z.object({
  lastName: z.string().min(1, "Фамилия обязательна").max(100),
  firstName: z.string().min(1, "Имя обязательно").max(100),
  middleName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
});

export const updateDriverSchema = z.object({
  lastName: z.string().min(1, "Фамилия обязательна").max(100).optional(),
  firstName: z.string().min(1, "Имя обязательно").max(100).optional(),
  middleName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
});

export const createClientSchema = z
  .object({
    type: z.enum(["individual", "legal"], {
      errorMap: () => ({ message: "Тип клиента обязателен" }),
    }),
    // Для физического лица
    lastName: z.string().min(1, "Фамилия обязательна").max(100).optional().nullable(),
    firstName: z.string().min(1, "Имя обязательно").max(100).optional().nullable(),
    middleName: z.string().max(100).optional().nullable(),
    // Для юридического лица
    organizationName: z
      .string()
      .min(1, "Название организации обязательно")
      .max(200)
      .optional()
      .nullable(),
    // Общие поля
    phone: z.string().max(20).optional().nullable(),
    email: z.string().email("Неверный формат email").optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "individual") {
      if (!data.lastName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Фамилия обязательна для физического лица",
          path: ["lastName"],
        });
      }
      if (!data.firstName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Имя обязательно для физического лица",
          path: ["firstName"],
        });
      }
    } else if (data.type === "legal") {
      if (!data.organizationName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Название организации обязательно для юридического лица",
          path: ["organizationName"],
        });
      }
    }
  });

export const updateClientSchema = z.object({
  type: z.enum(["individual", "legal"]).optional(),
  lastName: z.string().min(1, "Фамилия обязательна").max(100).optional(),
  firstName: z.string().min(1, "Имя обязательно").max(100).optional(),
  middleName: z.string().max(100).optional(),
  organizationName: z.string().min(1, "Название организации обязательно").max(200).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Неверный формат email").optional(),
});

export const quickCreateOrderSchema = z.object({
  // Упрощенная схема для быстрого создания
  clientId: z.number().int().positive("Клиент обязателен"),
  // Остальные поля со значениями по умолчанию
  type: z.enum(["delivery", "pickup"]).default("delivery"),
  address: z.string().default("Требуется уточнение"),
  payerLastName: z.string().default(""),
  payerFirstName: z.string().default(""),
  payerMiddleName: z.string().optional().nullable(),
  receiverLastName: z.string().default(""),
  receiverFirstName: z.string().default(""),
  receiverMiddleName: z.string().optional().nullable(),
  dateTime: z.string().default(new Date().toISOString()),
  hasPass: z.boolean().default(false),
  addressComment: z.string().optional().nullable(),
  status: z
    .enum(["new", "in_progress", "completed", "cancelled", "archived", "draft"])
    .default("draft"),
});

export const createOrderSchema = z.object({
  // Тип заявки
  type: z.enum(["delivery", "pickup"], {
    errorMap: () => ({ message: "Тип заявки обязателен" }),
  }),
  // Адрес
  address: z.string().min(1, "Адрес обязателен").max(500),
  // Плательщик
  payerLastName: z.string().min(1, "Фамилия плательщика обязательна").max(100),
  payerFirstName: z.string().min(1, "Имя плательщика обязательно").max(100),
  payerMiddleName: z.string().max(100).optional(),
  // Приемщик
  receiverLastName: z.string().min(1, "Фамилия приемщика обязательна").max(100),
  receiverFirstName: z.string().min(1, "Имя приемщика обязательно").max(100),
  receiverMiddleName: z.string().max(100).optional(),
  // Дата и время
  dateTime: z.string().min(1, "Дата и время обязательны"),
  // Пропуск
  hasPass: z.boolean().default(false),
  // Комментарий
  addressComment: z.string().max(1000).optional(),
  // Статус заявки
  status: z
    .enum(["new", "in_progress", "completed", "cancelled", "archived", "draft"])
    .default("new"),
  // Связи
  clientId: z.number().int().positive().optional().nullable(),
});

export const updateOrderSchema = z.object({
  type: z.enum(["delivery", "pickup"]).optional(),
  address: z.string().min(1, "Адрес обязателен").max(500).optional(),
  payerLastName: z.string().min(1, "Фамилия плательщика обязательна").max(100).optional(),
  payerFirstName: z.string().min(1, "Имя плательщика обязательно").max(100).optional(),
  payerMiddleName: z.string().max(100).optional(),
  receiverLastName: z.string().min(1, "Фамилия приемщика обязательна").max(100).optional(),
  receiverFirstName: z.string().min(1, "Имя приемщика обязательно").max(100).optional(),
  receiverMiddleName: z.string().max(100).optional(),
  dateTime: z.string().min(1, "Дата и время обязательны").optional(),
  hasPass: z.boolean().optional(),
  addressComment: z.string().max(1000).optional(),
  status: z.enum(["new", "in_progress", "completed", "cancelled", "archived", "draft"]).optional(),
  clientId: z.number().int().positive().optional().nullable(),
});

export const createPaymentSchema = z.object({
  orderId: z.number().int().positive(),
  deliveryId: z.number().int().positive().optional().nullable(),
  amount: z.number().int().positive("Сумма выплаты должна быть положительной"),
  paymentDate: z.string().min(1, "Дата выплаты обязательна"),
  type: z.enum(["prepayment", "transfer", "delivery"], {
    errorMap: () => ({ message: "Тип выплаты обязателен" }),
  }),
});

export const updatePaymentSchema = z.object({
  amount: z.number().int().positive("Сумма выплаты должна быть положительной").optional(),
  paymentDate: z.string().min(1, "Дата выплаты обязательна").optional(),
  type: z.enum(["prepayment", "transfer", "delivery"]).optional(),
});

export const createTransportCardSchema = z.object({
  cardNumber: z.string().min(1, "Номер карты обязателен").max(50),
  driverId: z.number().int().positive().optional().nullable(),
});

export const updateTransportCardSchema = z.object({
  cardNumber: z.string().min(1, "Номер карты обязателен").max(50).optional(),
  driverId: z.number().int().positive().optional().nullable(),
});

export const createTransportCardExpenseSchema = z.object({
  cardId: z.number().int().positive(),
  amount: z.number().int().positive("Сумма должна быть положительной"),
  paymentDate: z.string().min(1, "Дата оплаты обязательна"),
});

export const updateTransportCardExpenseSchema = z.object({
  amount: z.number().int().positive("Сумма должна быть положительной").optional(),
  paymentDate: z.string().min(1, "Дата оплаты обязательна").optional(),
});

export const createDeliverySchema = z.object({
  orderId: z.number().int().positive("ID заявки обязателен"),
  driverId: z.number().int().positive("Водитель обязателен"),
  carId: z.number().int().positive("Автомобиль обязателен"),
  dateTime: z.string().min(1, "Дата и время обязательны"),
  amount: z.number().int().positive("Стоимость должна быть положительной"),
  volume: z.number().int().positive().optional().nullable(),
  comment: z.string().optional(),
  paymentMethod: z.enum(["cash", "bank_transfer"], {
    errorMap: () => ({ message: "Тип оплаты обязателен" }),
  }),
  isPaid: z.boolean().default(false),
  isPaymentBeforeUnloading: z.boolean().default(false),
});

export const updateDeliverySchema = z.object({
  driverId: z.number().int().positive().optional(),
  carId: z.number().int().positive().optional(),
  dateTime: z.string().min(1, "Дата и время обязательны").optional(),
  amount: z.number().int().positive("Стоимость должна быть положительной").optional(),
  volume: z.number().int().positive().optional().nullable(),
  comment: z.string().optional(),
  paymentMethod: z.enum(["cash", "bank_transfer"]).optional(),
  isPaid: z.boolean().optional(),
  isPaymentBeforeUnloading: z.boolean().optional(),
});

// === Incomes (Доходы) Validators ===

export const createIncomeSchema = z.object({
  // Вид дохода - предоплата | оплата доставки
  incomeType: z.enum(["prepayment", "delivery_payment"], {
    errorMap: () => ({ message: "Вид дохода обязателен" }),
  }),
  // Тип дохода - наличный расчет | безналичный расчет
  paymentMethod: z.enum(["cash", "bank_transfer"], {
    errorMap: () => ({ message: "Тип оплаты обязателен" }),
  }),
  // Оплата произведена - true или false
  isPaid: z.boolean().optional().default(false),
  // Айди заявки к которой привязан доход
  orderId: z.number().int().positive("ID заявки обязателен"),
  // Сумма дохода
  amount: z.number().int().positive("Сумма должна быть положительной"),
  // Дата оплаты
  paymentDate: z.string().min(1, "Дата оплаты обязательна"),
  // Айди доставки к которой привязан доход (опционально)
  deliveryId: z.number().int().positive().optional().nullable(),
});

export const updateIncomeSchema = z.object({
  incomeType: z.enum(["prepayment", "delivery_payment"]).optional(),
  paymentMethod: z.enum(["cash", "bank_transfer"]).optional(),
  isPaid: z.boolean().optional(),
  orderId: z.number().int().positive().optional(),
  amount: z.number().int().positive("Сумма должна быть положительной").optional(),
  paymentDate: z.string().min(1, "Дата оплаты обязательна").optional(),
  deliveryId: z.number().int().positive().optional().nullable(),
});

export const completeDeliverySchema = z.object({});

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type CreateCarInput = z.infer<typeof createCarSchema>;
export type UpdateCarInput = z.infer<typeof updateCarSchema>;
export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type QuickCreateOrderInput = z.infer<typeof quickCreateOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type CreateTransportCardInput = z.infer<typeof createTransportCardSchema>;
export type UpdateTransportCardInput = z.infer<typeof updateTransportCardSchema>;
export type CreateTransportCardExpenseInput = z.infer<typeof createTransportCardExpenseSchema>;
export type UpdateTransportCardExpenseInput = z.infer<typeof updateTransportCardExpenseSchema>;
export type CreateDeliveryInput = z.infer<typeof createDeliverySchema>;
export type UpdateDeliveryInput = z.infer<typeof updateDeliverySchema>;
