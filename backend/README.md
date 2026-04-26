# Polanet Backend

RESTful API-сервер для системы управления логистикой Polanet, построенный на Express.js с SQLite базой данных и Drizzle ORM.

## 📋 Содержание

- [Стек технологий](#стек-технологий)
- [Структура проекта](#структура-проекта)
- [Установка](#установка)
- [Запуск проекта](#запуск-проекта)
- [База данных](#база-данных)
- [API Endpoints](#api-endpoints)
- [Аутентификация](#аутентификация)
- [Типы ролей](#типы-ролей)

## 🛠 Стек технологий

| Компонент      | Технология                    |
| -------------- | ----------------------------- |
| Runtime        | Node.js                       |
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
│   │   ├── schema.ts               # Определение таблиц и отношений (Drizzle schema)
│   │   ├── init.ts                 # Инициализация таблиц (SQL)
│   │   ├── migrate.ts              # Применение миграций Drizzle
│   │   └── seed.ts                 # Начальные данные (роли, админ)
│   ├── middleware/
│   │   ├── auth.ts                 # JWT аутентификация
│   │   └── validators.ts           # Zod схемы для валидации входных данных
│   └── routes/
│       ├── auth.ts                 # Аутентификация (login, register, me)
│       ├── users.ts                # CRUD пользователей
│       ├── roles.ts                # CRUD ролей
│       ├── cars.ts                 # CRUD автомобилей
│       ├── drivers.ts              # CRUD водителей (+ транспортные карты)
│       ├── clients.ts              # CRUD клиентов (физ/юр лица)
│       ├── orders.ts               # CRUD заявок + выплаты + история
│       ├── transportCards.ts       # Транспортные карты + расходы
│       ├── deliveries.ts           # Доставки по заявкам
│       └── incomes.ts              # Доходы (предоплата, оплата доставки)
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

### Миграции

Drizzle ORM использует систему миграций для управления изменениями схемы БД:

```bash
# Генерация миграции после изменения schema.ts
npm run db:generate

# Применение миграций
npm run db:migrate

# Альтернатива: push схема напрямую в БД (без миграционных файлов)
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

### Доставки

| Метод  | Endpoint                         | Описание                         |
| ------ | -------------------------------- | -------------------------------- |
| GET    | `/api/deliveries/order/:orderId` | Доставки по заявке               |
| GET    | `/api/deliveries/:id`            | Доставка по ID                   |
| POST   | `/api/deliveries`                | Создать доставку                 |
| PUT    | `/api/deliveries/:id`            | Обновить доставку                |
| DELETE | `/api/deliveries/:id`            | Удалить доставку                 |
| POST   | `/api/deliveries/:id/pay`        | Отметить доставку как оплаченную |

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

### Здоровье

| Метод | Endpoint      | Описание                   |
| ----- | ------------- | -------------------------- |
| GET   | `/api/health` | Проверка работоспособности |

## 🔐 Аутентификация

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

## 👥 Типы ролей

| Код    | Название      | Описание                                |
| ------ | ------------- | --------------------------------------- |
| ADMIN  | Администратор | Полный доступ ко всем функциям          |
| USER   | Пользователь  | Работа с заявками, клиентами, доставкой |
| VIEWER | Наблюдатель   | Только просмотр                         |

## 🗂 Схема базы данных

### Основные таблицы

| Таблица                   | Описание                                           |
| ------------------------- | -------------------------------------------------- |
| `roles`                   | Роли пользователей (ADMIN, USER, VIEWER)           |
| `users`                   | Пользователи системы с привязкой к ролям           |
| `sessions`                | JWT сессии                                         |
| `cars`                    | Автомобили (марка, гос. номер)                     |
| `drivers`                 | Водители (ФИО, телефон)                            |
| `clients`                 | Клиенты (физ/юр лица)                              |
| `orders`                  | Заявки (тип, адрес, стоимость, статус, плательщик) |
| `deliveries`              | Доставки (привязка к заявке, водителю, автомобилю) |
| `payments`                | Выплаты по заявкам                                 |
| `incomes`                 | Доходы (предоплата, оплата доставки)               |
| `order_history`           | История изменений заявок                           |
| `transport_cards`         | Транспортные карты (номер, привязка к водителю)    |
| `transport_card_expenses` | Расходы по транспортным картам                     |
| `transport_card_history`  | История изменений транспортных карт                |

### Статусы заявок

- `new` — новая
- `in_progress` — в работе
- `completed` — выполненная
- `cancelled` — отменённая
- `archived` — архивная
- `draft` — черновик

### Типы оплаты

- `cash` — наличный расчёт
- `bank_transfer` — безнал

### Типы клиентов

- `individual` — физическое лицо
- `legal` — юридическое лицо

### Типы заявок

- `delivery` — доставка
- `pickup` — самовывоз

### Типы выплат

- `prepayment` — предоплата
- `transfer` — перевод
- `delivery` — выплата при доставке

### Типы доходов (`incomeType`)

- `prepayment` — предоплата
- `delivery_payment` — оплата доставки

### Типы оплаты доходов (`paymentMethod`)

- `cash` — наличный расчёт
- `bank_transfer` — безналичный расчёт

## 🔧 Конфигурация

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
