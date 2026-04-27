# Polanet Backend

RESTful API-сервер для системы управления логистикой Polanet, построенный на Express.js с SQLite базой данных и Drizzle ORM.

## 📋 Содержание

- [Стек технологий](#стек-технологий)
- [Структура проекта](#структура-проекта)
- [Установка](#установка)
- [Запуск проекта](#запуск-проекта)
- [База данных](#база-данных)
- [API Endpoints](#api-endpoints)
- [Аутентификация и авторизация](#аутентификация-и-авторизация)
- [Типы ролей и права доступа](#типы-ролей-и-права-доступа)
- [Статусы заявок и цепочки переходов](#статусы-заявок-и-цепочки-переходов)
- [Схема базы данных](#схема-базы-данных)
- [Валидация данных](#валидация-данных)
- [Pre-commit хук](#pre-commit-хук)
- [Конфигурация](#конфигурация)
- [Скрипты](#скрипты)

## 🛠 Стек технологий

| Компонент      | Технология                    |
| -------------- | ----------------------------- |
| Runtime        | Node.js (ESM)                 |
| Framework      | Express.js                    |
| ORM            | Drizzle ORM                   |
| Database       | SQLite (better-sqlite3)       |
| Язык           | TypeScript                    |
| Валидация      | Zod                           |
| Аутентификация | JWT (jsonwebtoken)            |
| Хеширование    | bcryptjs                      |
| Dev-tools      | tsx (watch mode), drizzle-kit |

## 📁 Структура проекта

```
backend/
├── src/
│   ├── index.ts                    # Точка входа, настройка Express
│   ├── db/
│   │   ├── index.ts                # Подключение к БД (drizzle + better-sqlite3)
│   │   ├── schema.ts               # Определение таблиц, отношений и типов
│   │   ├── init.ts                 # Инициализация таблиц (SQL DDL)
│   │   ├── migrate.ts              # Применение миграций Drizzle
│   │   └── seed.ts                 # Начальные данные (роли, админ)
│   ├── middleware/
│   │   ├── auth.ts                 # JWT аутентификация (authenticate, generateToken)
│   │   └── validators.ts           # Zod схемы для валидации входных данных
│   └── routes/
│       ├── auth.ts                 # Аутентификация (login, register, me, logout)
│       ├── users.ts                # CRUD пользователей
│       ├── roles.ts                # CRUD ролей
│       ├── cars.ts                 # CRUD автомобилей
│       ├── drivers.ts              # CRUD водителей (+ транспортные карты)
│       ├── clients.ts              # CRUD клиентов (физ/юр лица)
│       ├── orders.ts               # CRUD заявок + выплаты + история
│       ├── transportCards.ts       # Транспортные карты + расходы + история
│       ├── deliveries.ts           # Доставки по заявкам
│       ├── incomes.ts              # Доходы (предоплата, оплата доставки)
│       └── expenses.ts             # Расходы (зарплата, топливо)
├── data/
│   └── polanet.db                  # База данных SQLite
├── drizzle/                        # Миграции Drizzle (генерируются автоматически)
├── drizzle.config.ts               # Конфигурация Drizzle Kit
├── package.json
└── tsconfig.json
```

## 📦 Установка

```bash
cd backend
npm install
```

## 🚀 Запуск проекта

### Разработка (с hot-reload)

```bash
npm run dev
```

Сервер запустится на `http://localhost:3000`

### Продакшн

```bash
npm run build    # Компиляция TypeScript в ./dist
npm start        # Запуск скомпилированного кода
```

## 🗄 База данных

### Инициализация

Таблицы создаются автоматически при первом запуске через [`src/db/init.ts`](src/db/init.ts).

Используется режим WAL (`PRAGMA journal_mode = WAL`) для лучшей производительности при конкурентном доступе.

### Миграции

Drizzle ORM использует систему миграций для управления изменениями схемы БД:

```bash
# Генерация миграции после изменения schema.ts
npm run db:generate

# Применение миграций
npm run db:migrate

# Альтернатива: push схемы напрямую в БД (без миграционных файлов)
npm run db:push
```

### Начальные данные (Seed)

Для создания начальных данных (роли и администратор):

```bash
npm run db:seed
```

Создаёт:

- **Роли**: ADMIN (Администратор), USER (Пользователь), VIEWER (Наблюдатель)
- **Администратор**: `admin@polanet.local` / пароль: `admin123`

## 📡 API Endpoints

### Аутентификация

| Метод | Endpoint             | Описание                               |
| ----- | -------------------- | -------------------------------------- |
| POST  | `/api/auth/login`    | Вход (email + пароль)                  |
| POST  | `/api/auth/register` | Регистрация                            |
| GET   | `/api/auth/me`       | Текущий пользователь (требуется токен) |
| POST  | `/api/auth/logout`   | Выход                                  |

### Пользователи

| Метод  | Endpoint         | Описание                  |
| ------ | ---------------- | ------------------------- |
| GET    | `/api/users`     | Список всех пользователей |
| GET    | `/api/users/:id` | Пользователь по ID        |
| POST   | `/api/users`     | Создать пользователя      |
| PUT    | `/api/users/:id` | Обновить пользователя     |
| DELETE | `/api/users/:id` | Удалить пользователя      |

### Роли

| Метод  | Endpoint         | Описание      |
| ------ | ---------------- | ------------- |
| GET    | `/api/roles`     | Список ролей  |
| GET    | `/api/roles/:id` | Роль по ID    |
| POST   | `/api/roles`     | Создать роль  |
| PUT    | `/api/roles/:id` | Обновить роль |
| DELETE | `/api/roles/:id` | Удалить роль  |

### Автомобили

| Метод  | Endpoint        | Описание            |
| ------ | --------------- | ------------------- |
| GET    | `/api/cars`     | Список автомобилей  |
| GET    | `/api/cars/:id` | Автомобиль по ID    |
| POST   | `/api/cars`     | Создать автомобиль  |
| PUT    | `/api/cars/:id` | Обновить автомобиль |
| DELETE | `/api/cars/:id` | Удалить автомобиль  |

### Водители

| Метод  | Endpoint           | Описание                              |
| ------ | ------------------ | ------------------------------------- |
| GET    | `/api/drivers`     | Список водителей                      |
| GET    | `/api/drivers/:id` | Водитель по ID (+ транспортная карта) |
| POST   | `/api/drivers`     | Создать водителя                      |
| PUT    | `/api/drivers/:id` | Обновить водителя                     |
| DELETE | `/api/drivers/:id` | Удалить водителя                      |

### Клиенты

| Метод  | Endpoint           | Описание         |
| ------ | ------------------ | ---------------- |
| GET    | `/api/clients`     | Список клиентов  |
| GET    | `/api/clients/:id` | Клиент по ID     |
| POST   | `/api/clients`     | Создать клиента  |
| PUT    | `/api/clients/:id` | Обновить клиента |
| DELETE | `/api/clients/:id` | Удалить клиента  |

**Типы клиентов**:

- `individual` — физическое лицо (фамилия, имя, отчество)
- `legal` — юридическое лицо (название организации)

Каждый клиент имеет информацию о:

- **Плательщике** (payer): ФИО, телефон
- **Приёмщике** (receiver): ФИО, телефон

### Заявки

| Метод  | Endpoint                              | Описание                                    |
| ------ | ------------------------------------- | ------------------------------------------- |
| GET    | `/api/orders`                         | Список заявок                               |
| GET    | `/api/orders/:id`                     | Заявка по ID (+ выплаты, доставки, история) |
| POST   | `/api/orders`                         | Создать заявку                              |
| POST   | `/api/orders/quick`                   | Быстрое создание заявки                     |
| PUT    | `/api/orders/:id`                     | Обновить заявку                             |
| DELETE | `/api/orders/:id`                     | Удалить заявку                              |
| POST   | `/api/orders/:id/payments`            | Добавить выплату по заявке                  |
| DELETE | `/api/orders/:id/payments/:paymentId` | Удалить выплату                             |
| GET    | `/api/orders/:id/history`             | История изменений заявки                    |

**Типы заявок**:

- `delivery` — доставка
- `pickup` — самовывоз

**Статусы заявок**: `draft`, `new`, `in_progress`, `completed`, `cancelled`, `archived`

### Транспортные карты

| Метод  | Endpoint                                           | Описание                         |
| ------ | -------------------------------------------------- | -------------------------------- |
| GET    | `/api/transport-cards`                             | Список карт                      |
| GET    | `/api/transport-cards/:id`                         | Карта по ID (+ расходы, история) |
| POST   | `/api/transport-cards`                             | Создать карту                    |
| PUT    | `/api/transport-cards/:id`                         | Обновить карту                   |
| DELETE | `/api/transport-cards/:id`                         | Удалить карту                    |
| POST   | `/api/transport-cards/:id/expenses`                | Добавить расход                  |
| DELETE | `/api/transport-cards/:cardId/expenses/:expenseId` | Удалить расход                   |

**Статусы карт**: `active`, `inactive`

### Доставки

| Метод  | Endpoint                         | Описание           |
| ------ | -------------------------------- | ------------------ |
| GET    | `/api/deliveries/order/:orderId` | Доставки по заявке |
| GET    | `/api/deliveries/:id`            | Доставка по ID     |
| POST   | `/api/deliveries`                | Создать доставку   |
| PUT    | `/api/deliveries/:id`            | Обновить доставку  |
| DELETE | `/api/deliveries/:id`            | Удалить доставку   |
| POST   | `/api/deliveries/:id/complete`   | Завершить доставку |

**Статусы доставок**: `in_progress`, `completed`

**Типы оплаты**: `cash` (наличный), `bank_transfer` (безналичный)

### Доходы

| Метод  | Endpoint           | Описание                                 |
| ------ | ------------------ | ---------------------------------------- |
| GET    | `/api/incomes`     | Список всех доходов с фильтрацией        |
| GET    | `/api/incomes/:id` | Доход по ID (+ данные заявки и доставки) |
| POST   | `/api/incomes`     | Создать доход                            |
| PUT    | `/api/incomes/:id` | Обновить доход                           |
| DELETE | `/api/incomes/:id` | Удалить доход                            |

**Query параметры для фильтрации (`GET /api/incomes`)**:

| Параметр        | Тип       | Описание                                         |
| --------------- | --------- | ------------------------------------------------ |
| `isPaid`        | `boolean` | Фильтр по статусу оплаты                         |
| `paymentMethod` | `string`  | Фильтр по типу оплаты (`cash` / `bank_transfer`) |
| `orderId`       | `number`  | Поиск по ID заявки                               |
| `id`            | `number`  | Поиск по ID дохода                               |

**Виды доходов (`incomeType`)**:

- `prepayment` — предоплата
- `delivery_payment` — оплата доставки

**Типы оплаты (`paymentMethod`)**:

- `cash` — наличный расчёт
- `bank_transfer` — безналичный расчёт

### Расходы

| Метод  | Endpoint            | Описание        |
| ------ | ------------------- | --------------- |
| GET    | `/api/expenses`     | Список расходов |
| GET    | `/api/expenses/:id` | Расход по ID    |
| POST   | `/api/expenses`     | Создать расход  |
| PUT    | `/api/expenses/:id` | Обновить расход |
| DELETE | `/api/expenses/:id` | Удалить расход  |

**Типы расходов (`expenseType`)**:

- `salary` — зарплата
- `fuel` — топливо

**Типы оплаты (`paymentType`)**:

- `cash` — наличный расчёт
- `bank_transfer` — безналичный расчёт

### Здоровье

| Метод | Endpoint      | Описание                   |
| ----- | ------------- | -------------------------- |
| GET   | `/api/health` | Проверка работоспособности |

## 🔐 Аутентификация и авторизация

Все endpoints, кроме `/api/auth/login` и `/api/auth/register`, требуют JWT токен.

### Получение токена

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@polanet.local","password":"admin123"}'
```

### Использование токена

```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer <your-token>"
```

### Middleware аутентификации

- [`authenticate()`](src/middleware/auth.ts) — проверяет JWT токен из заголовка `Authorization`
- Токен хранится 24 часа
- В `AuthRequest` добавляются `userId` и `user` (id, email, roleId)
- [`generateToken()`](src/middleware/auth.ts:38) — создаёт JWT с payload: `{ id, userId, email, roleId }`

## 👥 Типы ролей и права доступа

| Код    | Название      | Описание                                |
| ------ | ------------- | --------------------------------------- |
| ADMIN  | Администратор | Полный доступ ко всем функциям          |
| USER   | Пользователь  | Работа с заявками, клиентами, доставкой |
| VIEWER | Наблюдатель   | Только просмотр                         |

## 📊 Статусы заявок и цепочки переходов

Система управляет жизненным циклом заявок через строгую цепочку переходов статусов:

### Доступные статусы

| Код           | Название    | Описание        |
| ------------- | ----------- | --------------- |
| `draft`       | Черновик    | Черновик заявки |
| `new`         | Новая       | Новая заявка    |
| `in_progress` | Выполняется | В работе        |
| `completed`   | Завершено   | Завершённая     |
| `cancelled`   | Отменено    | Отменённая      |
| `archived`    | Архив       | Архивная        |

### Цепочка переходов статусов

```
Черновик ──→ Новая ──────→ Выполняется ──→ Завершено ──→ Архив
   │              │                       │
   │              └──────→ Отменено ───────┘
   │                       │
   └───────────────────────┘
```

| Текущий статус | Доступные переходы           |
| -------------- | ---------------------------- |
| Черновик       | Новая, Выполняется, Отменено |
| Новая          | Выполняется, Отменено        |
| Выполняется    | Завершено                    |
| Завершено      | Архив                        |
| Отменено       | Архив                        |
| Архив          | Нет (конечный статус)        |

### Автоматические переходы

При создании доставки заявка автоматически переводится в статус **"Выполняется"** (если она не находится уже в этом статусе). Переход валидируется по цепочке — если из текущего статуса нельзя перейти в "Выполняется", будет возвращена ошибка.

## 🗂 Схема базы данных

### Основные таблицы

| Таблица                   | Описание                                           |
| ------------------------- | -------------------------------------------------- |
| `roles`                   | Роли пользователей (ADMIN, USER, VIEWER)           |
| `users`                   | Пользователи системы с привязкой к ролям           |
| `sessions`                | JWT сессии                                         |
| `cars`                    | Автомобили (марка, гос. номер)                     |
| `drivers`                 | Водители (ФИО, телефон)                            |
| `clients`                 | Клиенты (физ/юр лица, плательщик, приемщик)        |
| `orders`                  | Заявки (тип, адрес, стоимость, статус, плательщик) |
| `deliveries`              | Доставки (привязка к заявке, водителю, автомобилю) |
| `payments`                | Выплаты по заявкам                                 |
| `incomes`                 | Доходы (предоплата, оплата доставки)               |
| `expenses`                | Расходы (зарплата, топливо)                        |
| `order_history`           | История изменений заявок                           |
| `transport_cards`         | Транспортные карты (номер, привязка к водителю)    |
| `transport_card_expenses` | Расходы по транспортным картам                     |
| `transport_card_history`  | История изменений транспортных карт                |

### Отношения (Relations)

```
roles 1───< users N
users 1───< orders N
users 1───< order_history N
clients 1───< orders N
cars 1───< deliveries N
drivers 1───< deliveries N
drivers 1───< transport_cards 0..1
orders 1───< payments N
orders 1───< deliveries N
orders 1───< incomes N
orders 1───< order_history N
deliveries 1───< incomes N
deliveries N───< payments 0..1
transport_cards 1───< transport_card_expenses N
transport_cards 1───< transport_card_history N
expenses N───< transport_cards 0..1
expenses N───< drivers 0..1
```

### Типы данных

#### Типы клиентов

- `individual` — физическое лицо
- `legal` — юридическое лицо

#### Типы заявок

- `delivery` — доставка
- `pickup` — самовывоз

#### Типы выплат

- `prepayment` — предоплата
- `transfer` — перевод
- `delivery` — выплата при доставке

#### Типы доходов (`incomeType`)

- `prepayment` — предоплата
- `delivery_payment` — оплата доставки

#### Типы оплаты доходов (`paymentMethod`)

- `cash` — наличный расчёт
- `bank_transfer` — безналичный расчёт

#### Типы расходов (`expenseType`)

- `salary` — зарплата
- `fuel` — топливо

## ✅ Валидация данных

Все входные данные валидируются с помощью **Zod схем** в [`src/middleware/validators.ts`](src/middleware/validators.ts):

| Схема                                         | Описание                    |
| --------------------------------------------- | --------------------------- |
| `loginSchema`                                 | Вход (email + пароль)       |
| `registerSchema`                              | Регистрация пользователя    |
| `updateUserSchema`                            | Обновление пользователя     |
| `createRoleSchema`                            | Создание роли               |
| `createCarSchema` / `updateCarSchema`         | CRUD автомобилей            |
| `createDriverSchema` / `updateDriverSchema`   | CRUD водителей              |
| `createClientSchema` / `updateClientSchema`   | CRUD клиентов               |
| `createOrderSchema` / `updateOrderSchema`     | CRUD заявок                 |
| `quickCreateOrderSchema`                      | Быстрое создание заявки     |
| `createPaymentSchema` / `updatePaymentSchema` | CRUD выплат                 |
| `createTransportCardSchema`                   | Создание транспортной карты |
| `createDeliverySchema`                        | Создание доставки           |
| `createIncomeSchema` / `updateIncomeSchema`   | CRUD доходов                |

### Валидация статусов заявок

Функция [`validateOrderStatusTransition()`](src/middleware/validators.ts:188) проверяет допустимость перехода между статусами согласно определённой цепочке.

## 🔄 Pre-commit хук

Проект использует Husky для git хуков. Перед каждым коммитом автоматически выполняются:

1. **Линтинг фронтенда** — проверка кода через ESLint
2. **Тесты** — запуск тестового набора (Vitest)

Если хотя бы один из шагов падает, коммит не создаётся.

### Настройка

```bash
# Установка хуков (выполняется автоматически при npm install)
npm run prepare

# Ручной запуск проверок
npm run lint:frontend   # Линтинг фронтенда
npm run test:run        # Тесты фронтенда
```

### Фронтенд тесты

Фронтенд использует **Vitest** с **React Testing Library**:

```bash
# Запустить все тесты в watch режиме
npm run test

# Запустить тесты один раз (для CI/CD)
npm run test:run

# Запустить тесты с UI
npm run test:ui
```

**Расположение тестов**:

- [`frontend/src/lib/utils.test.ts`](src/lib/utils.test.ts) — тесты утилит (9 тестов)
- [`frontend/src/lib/types/transport-card-types.test.ts`](src/lib/types/transport-card-types.test.ts) — тесты Zod схем (12 тестов)
- [`frontend/src/components/ui/button.test.tsx`](src/components/ui/button.test.tsx) — тесты React компонентов (14 тестов)

**Итого**: 35 тестов в 3 тестовых файлах.

## ⚙️ Конфигурация

### Переменные окружения

| Переменная   | По умолчанию                           | Описание           |
| ------------ | -------------------------------------- | ------------------ |
| `PORT`       | `3000`                                 | Порт сервера       |
| `JWT_SECRET` | `your-secret-key-change-in-production` | Секретный ключ JWT |

### Drizzle Kit

Конфигурация в [`drizzle.config.ts`](drizzle.config.ts):

```typescript
{
  schema: './src/db/schema.ts',    // Файл схемы
  out: './drizzle',                 // Папка миграций
  dialect: 'sqlite',                // Диалект БД
  dbCredentials: {
    url: './data/polanet.db',       // Путь к БД
  }
}
```

## 📝 Скрипты

| Команда               | Описание                               |
| --------------------- | -------------------------------------- |
| `npm run dev`         | Запуск в режиме разработки (tsx watch) |
| `npm run build`       | Компиляция TypeScript                  |
| `npm start`           | Запуск продакшн-сервера                |
| `npm run db:generate` | Генерация миграций                     |
| `npm run db:migrate`  | Применение миграций                    |
| `npm run db:push`     | Push схемы в БД                        |
| `npm run db:seed`     | Загрузка начальных данных              |
| `npm run lint`        | Линтинг TypeScript кода                |
| `npm run lint:fix`    | Автоисправление линтинга               |
