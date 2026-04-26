import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lastName: text("last_name").notNull(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  birthDate: text("birth_date"),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  roleId: integer("role_id")
    .references(() => roles.id)
    .notNull(),
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

export const drivers = sqliteTable("drivers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lastName: text("last_name").notNull(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  phone: text("phone"),
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
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // Тип заявки
  type: text("type", { enum: ["delivery", "pickup"] }).notNull(),
  // Адрес
  address: text("address").notNull(),
  // Стоимость
  cost: integer("cost").notNull(),
  // Плательщик
  payerLastName: text("payer_last_name").notNull(),
  payerFirstName: text("payer_first_name").notNull(),
  payerMiddleName: text("payer_middle_name"),
  // Приемщик
  receiverLastName: text("receiver_last_name").notNull(),
  receiverFirstName: text("receiver_first_name").notNull(),
  receiverMiddleName: text("receiver_middle_name"),
  // Дата и время
  dateTime: text("date_time").notNull(),
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
  // Тип оплаты
  paymentType: text("payment_type", {
    enum: ["cash", "bank_transfer"],
  }).notNull(),
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
  // Водитель и автомобиль
  driverId: integer("driver_id")
    .notNull()
    .references(() => drivers.id),
  carId: integer("car_id")
    .notNull()
    .references(() => cars.id),
  // Дата и время доставки
  dateTime: text("date_time").notNull(),
  // Стоимость доставки
  cost: integer("cost").notNull(),
  // Объем груза (м³)
  volume: integer("volume"),
  // Комментарий
  comment: text("comment"),
  // Оплата
  isPaid: integer("is_paid", { mode: "boolean" }).notNull().default(false),
  isCashPayment: integer("is_cash_payment", { mode: "boolean" })
    .notNull()
    .default(false),
  isUnloadingBeforeUnloading: integer("is_unloading_before_unloading", {
    mode: "boolean",
  })
    .notNull()
    .default(false),
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
  // Айди доставки, к которой привязан доход (только в случае если вид дохода - оплата доставки)
  deliveryId: integer("delivery_id").references(() => deliveries.id, {
    onDelete: "set null",
  }),
  // Сумма дохода
  amount: integer("amount").notNull(),
  // Дата оплаты
  paymentDate: text("payment_date").notNull(),
  // Аудит
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Relations
export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  createdOrders: many(orders),
  orderHistory: many(orderHistory),
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
  driver: one(drivers, {
    fields: [deliveries.driverId],
    references: [drivers.id],
  }),
  car: one(cars, {
    fields: [deliveries.carId],
    references: [cars.id],
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

export const transportCards = sqliteTable("transport_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardNumber: text("card_number").notNull().unique(),
  driverId: integer("driver_id").references(() => drivers.id, {
    onDelete: "set null",
  }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
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
  action: text("action").notNull(), // 'created', 'updated', 'deleted', 'expense_added', 'expense_removed', 'driver_assigned', 'driver_unassigned'
  fieldName: text("field_name"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  createdAt: text("created_at").notNull(),
});

// Relations
export const transportCardsRelations = relations(
  transportCards,
  ({ one, many }) => ({
    driver: one(drivers, {
      fields: [transportCards.driverId],
      references: [drivers.id],
    }),
    expenses: many(transportCardExpenses),
    history: many(transportCardHistory),
  }),
);

export const driversRelations = relations(drivers, ({ one, many }) => ({
  orders: many(orders),
  transportCard: one(transportCards),
}));

export const transportCardExpensesRelations = relations(
  transportCardExpenses,
  ({ one }) => ({
    card: one(transportCards, {
      fields: [transportCardExpenses.cardId],
      references: [transportCards.id],
    }),
  }),
);

export const transportCardHistoryRelations = relations(
  transportCardHistory,
  ({ one }) => ({
    card: one(transportCards, {
      fields: [transportCardHistory.cardId],
      references: [transportCards.id],
    }),
    user: one(users, {
      fields: [transportCardHistory.userId],
      references: [users.id],
    }),
  }),
);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Car = typeof cars.$inferSelect;
export type NewCar = typeof cars.$inferInsert;
export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;
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
