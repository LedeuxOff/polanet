import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP").notNull(),
});

// Таблица прав доступа
export const permissions = sqliteTable("permissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  module: text("module").notNull(),
  description: text("description"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP").notNull(),
});

// Таблица связей ролей с правами
export const rolePermissions = sqliteTable("role_permissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roleId: integer("role_id")
    .references(() => roles.id, { onDelete: "cascade" })
    .notNull(),
  permissionId: integer("permission_id")
    .references(() => permissions.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lastName: text("last_name").notNull(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  birthDate: text("birth_date"),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  telegramChatId: text("telegram_chat_id"),
  passwordHash: text("password_hash").notNull(),
  roleId: integer("role_id")
    .references(() => roles.id)
    .notNull(),
  transportCardId: integer("transport_card_id").references(() => transportCards.id, {
    onDelete: "set null",
  }),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const cars = sqliteTable("cars", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  brand: text("brand").notNull(),
  licensePlate: text("license_plate").notNull().unique(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const clients = sqliteTable("clients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["individual", "legal"] }).notNull(),
  // Для физического лица
  lastName: text("last_name"),
  firstName: text("first_name"),
  middleName: text("middle_name"),
  // Для юридического лица
  organizationName: text("organization_name"),
  // Общие поля
  phone: text("phone"),
  email: text("email"),
  // Плательщик
  payerLastName: text("payer_last_name"),
  payerFirstName: text("payer_first_name"),
  payerMiddleName: text("payer_middle_name"),
  payerPhone: text("payer_phone"),
  // Приемщик
  receiverLastName: text("receiver_last_name"),
  receiverFirstName: text("receiver_first_name"),
  receiverMiddleName: text("receiver_middle_name"),
  receiverPhone: text("receiver_phone"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // Тип заявки
  type: text("type", { enum: ["delivery", "pickup"] }).notNull(),
  // Адрес
  address: text("address").notNull(),
  // Плательщик
  payerLastName: text("payer_last_name").notNull(),
  payerFirstName: text("payer_first_name").notNull(),
  payerMiddleName: text("payer_middle_name"),
  payerPhone: text("payer_phone"),
  // Приемщик
  receiverLastName: text("receiver_last_name").notNull(),
  receiverFirstName: text("receiver_first_name").notNull(),
  receiverMiddleName: text("receiver_middle_name"),
  receiverPhone: text("receiver_phone"),
  // Дата
  date: text("date").notNull(),
  // Объем груза (м³)
  volume: integer("volume"),
  // Пропуск
  hasPass: integer("has_pass", { mode: "boolean" }).notNull().default(false),
  // Комментарий
  addressComment: text("address_comment"),
  // Статус заявки
  status: text("status", {
    enum: ["new", "in_progress", "completed", "cancelled", "archived", "draft"],
  })
    .notNull()
    .default("new"),
  // Связи
  clientId: integer("client_id").references(() => clients.id),
  // Аудит
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const deliveries = sqliteTable("deliveries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  // Водитель (теперь ссылается на users.id) и автомобиль
  driverId: integer("driver_id")
    .notNull()
    .references(() => users.id),
  carId: integer("car_id")
    .notNull()
    .references(() => cars.id),
  // Дата и время доставки
  dateTime: text("date_time").notNull(),
  // Объем груза (м³)
  volume: integer("volume"),
  // Комментарий
  comment: text("comment"),
  // Тип оплаты - наличный расчет | безналичный расчет
  paymentMethod: text("payment_method", {
    enum: ["cash", "bank_transfer"],
  }).notNull(),
  // Оплата до выгрузки
  isPaymentBeforeUnloading: integer("is_payment_before_unloading", {
    mode: "boolean",
  })
    .notNull()
    .default(false),
  // Уведомления
  notifyClient: integer("notify_client", { mode: "boolean" }).notNull().default(false),
  notifyDriver: integer("notify_driver", { mode: "boolean" }).notNull().default(false),
  // Статус доставки - in_progress | completed
  status: text("status", {
    enum: ["in_progress", "completed"],
  })
    .notNull()
    .default("in_progress"),
  // Связь с доходом (ссылка на income, создается при привязке дохода к доставке)
  incomeId: integer("income_id"),
  // Аудит
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  deliveryId: integer("delivery_id").references(() => deliveries.id, {
    onDelete: "set null",
  }),
  amount: integer("amount").notNull(),
  paymentDate: text("payment_date").notNull(),
  type: text("type", { enum: ["prepayment", "transfer", "delivery"] })
    .notNull()
    .default("transfer"),
  createdAt: text("created_at").notNull(),
});

export const orderHistory = sqliteTable("order_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(), // 'created', 'updated', 'status_changed', 'payment_added'
  fieldName: text("field_name"), // какое поле изменено
  oldValue: text("old_value"), // старое значение
  newValue: text("new_value"), // новое значение
  createdAt: text("created_at").notNull(),
});

// === Incomes (Доходы) ===

export const incomes = sqliteTable("incomes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // Вид дохода - предоплата | оплата доставки
  incomeType: text("income_type", {
    enum: ["prepayment", "delivery_payment"],
  }).notNull(),
  // Тип дохода - наличный расчет | безналичный расчет
  paymentMethod: text("payment_method", {
    enum: ["cash", "bank_transfer"],
  }).notNull(),
  // Оплата произведена - true или false
  isPaid: integer("is_paid", { mode: "boolean" }).notNull().default(false),
  // Айди заявки к которой привязан доход
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  // Сумма дохода
  amount: integer("amount").notNull(),
  // Дата оплаты
  paymentDate: text("payment_date").notNull(),
  // Айди доставки к которой привязан доход (опционально)
  deliveryId: integer("delivery_id"),
  // Айди получателя (id сотрудника)
  recipientId: integer("recipient_id"),
  // Аудит
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Relations
export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  rolePermissions: many(rolePermissions),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  transportCard: one(transportCards, {
    fields: [users.transportCardId],
    references: [transportCards.id],
  }),
  createdOrders: many(orders),
  orderHistory: many(orderHistory),
  deliveriesAsDriver: many(deliveries),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  orders: many(orders),
}));

export const carsRelations = relations(cars, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  client: one(clients, {
    fields: [orders.clientId],
    references: [clients.id],
  }),
  createdBy: one(users, {
    fields: [orders.createdById],
    references: [users.id],
  }),
  payments: many(payments),
  history: many(orderHistory),
  deliveries: many(deliveries),
  incomes: many(incomes),
}));

export const deliveriesRelations = relations(deliveries, ({ one, many }) => ({
  order: one(orders, {
    fields: [deliveries.orderId],
    references: [orders.id],
  }),
  driver: one(users, {
    fields: [deliveries.driverId],
    references: [users.id],
  }),
  car: one(cars, {
    fields: [deliveries.carId],
    references: [cars.id],
  }),
  income: one(incomes, {
    fields: [deliveries.incomeId],
    references: [incomes.id],
  }),
  incomes: many(incomes),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const orderHistoryRelations = relations(orderHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderHistory.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [orderHistory.userId],
    references: [users.id],
  }),
}));

// Relations for incomes
export const incomesRelations = relations(incomes, ({ one }) => ({
  order: one(orders, {
    fields: [incomes.orderId],
    references: [orders.id],
  }),
  delivery: one(deliveries, {
    fields: [incomes.deliveryId],
    references: [deliveries.id],
  }),
}));

// Transport cards - привязываются к сотрудникам через users.transportCardId
export const transportCards = sqliteTable("transport_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardNumber: text("card_number").notNull().unique(),
  status: text("status", { enum: ["active", "inactive"] })
    .notNull()
    .default("active"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const transportCardExpenses = sqliteTable("transport_card_expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardId: integer("card_id")
    .notNull()
    .references(() => transportCards.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  paymentDate: text("payment_date").notNull(),
  createdAt: text("created_at").notNull(),
});

export const transportCardHistory = sqliteTable("transport_card_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardId: integer("card_id")
    .notNull()
    .references(() => transportCards.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(), // 'created', 'updated', 'deleted', 'expense_added', 'expense_removed', 'employee_assigned', 'employee_unassigned'
  fieldName: text("field_name"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  createdAt: text("created_at").notNull(),
});

// Relations для transport cards
export const transportCardsRelations = relations(transportCards, ({ many }) => ({
  expenses: many(transportCardExpenses),
  history: many(transportCardHistory),
}));

export const transportCardExpensesRelations = relations(transportCardExpenses, ({ one }) => ({
  card: one(transportCards, {
    fields: [transportCardExpenses.cardId],
    references: [transportCards.id],
  }),
}));

export const transportCardHistoryRelations = relations(transportCardHistory, ({ one }) => ({
  card: one(transportCards, {
    fields: [transportCardHistory.cardId],
    references: [transportCards.id],
  }),
  user: one(users, {
    fields: [transportCardHistory.userId],
    references: [users.id],
  }),
}));

// Expenses table - driverId теперь ссылается на users.id
export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  expenseType: text("expense_type", { enum: ["salary", "fuel"] }).notNull(),
  paymentType: text("payment_type", { enum: ["cash", "bank_transfer"] }).notNull(),
  transportCardId: integer("transport_card_id").references(() => transportCards.id, {
    onDelete: "set null",
  }),
  driverId: integer("driver_id").references(() => users.id, {
    onDelete: "set null",
  }),
  dateTime: text("date_time").notNull(),
  amount: integer("amount").notNull(),
  comment: text("comment"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// === Templates (Шаблоны заявок) ===

export const templates = sqliteTable("templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // Тип заявки
  type: text("type", { enum: ["delivery", "pickup"] }).notNull(),
  // Адрес
  address: text("address").notNull(),
  // Плательщик
  payerLastName: text("payer_last_name").notNull(),
  payerFirstName: text("payer_first_name").notNull(),
  payerMiddleName: text("payer_middle_name"),
  payerPhone: text("payer_phone"),
  // Приемщик
  receiverLastName: text("receiver_last_name").notNull(),
  receiverFirstName: text("receiver_first_name").notNull(),
  receiverMiddleName: text("receiver_middle_name"),
  receiverPhone: text("receiver_phone"),
  // Дата
  date: text("date").notNull(),
  // Объем груза (м³)
  volume: integer("volume"),
  // Пропуск
  hasPass: integer("has_pass", { mode: "boolean" }).notNull().default(false),
  // Комментарий
  addressComment: text("address_comment"),
  // Связи
  clientId: integer("client_id").references(() => clients.id),
  // Аудит
  createdById: integer("created_by_id")
    .references(() => users.id)
    .notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Recipient History table - tracks all recipient changes
export const recipientHistory = sqliteTable("recipient_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  deliveryId: integer("delivery_id")
    .notNull()
    .references(() => deliveries.id, { onDelete: "cascade" }),
  incomeId: integer("income_id").references(() => incomes.id, { onDelete: "set null" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  recipientId: integer("recipient_id"),
  oldRecipientId: integer("old_recipient_id"),
  action: text("action").notNull(), // 'created', 'updated', 'deleted'
  comment: text("comment"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

// Relations for recipient history
export const recipientHistoryRelations = relations(recipientHistory, ({ one }) => ({
  delivery: one(deliveries, {
    fields: [recipientHistory.deliveryId],
    references: [deliveries.id],
  }),
  income: one(incomes, {
    fields: [recipientHistory.incomeId],
    references: [incomes.id],
  }),
  user: one(users, {
    fields: [recipientHistory.userId],
    references: [users.id],
  }),
}));

// Relations for expenses
export const expensesRelations = relations(expenses, ({ one }) => ({
  transportCard: one(transportCards, {
    fields: [expenses.transportCardId],
    references: [transportCards.id],
  }),
  driver: one(users, {
    fields: [expenses.driverId],
    references: [users.id],
  }),
}));

// Relations for templates
export const templatesRelations = relations(templates, ({ one }) => ({
  createdBy: one(users, {
    fields: [templates.createdById],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [templates.clientId],
    references: [clients.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Car = typeof cars.$inferSelect;
export type NewCar = typeof cars.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type OrderHistory = typeof orderHistory.$inferSelect;
export type NewOrderHistory = typeof orderHistory.$inferInsert;
export type TransportCard = typeof transportCards.$inferSelect;
export type NewTransportCard = typeof transportCards.$inferInsert;
export type TransportCardExpense = typeof transportCardExpenses.$inferSelect;
export type NewTransportCardExpense = typeof transportCardExpenses.$inferInsert;
export type TransportCardHistory = typeof transportCardHistory.$inferSelect;
export type NewTransportCardHistory = typeof transportCardHistory.$inferInsert;
export type Delivery = typeof deliveries.$inferSelect;
export type NewDelivery = typeof deliveries.$inferInsert;
export type Income = typeof incomes.$inferSelect;
export type NewIncome = typeof incomes.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;

// Отношения для permissions
export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

// Отношения для rolePermissions
export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));
