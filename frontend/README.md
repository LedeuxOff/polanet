# Polanet Admin Panel

Fullstack приложение - административная панель для управления логистикой.

## Стек технологий

### Фронтенд

- React 18 + TypeScript
- TanStack Router (роутинг)
- TanStack Table (таблицы)
- shadcn/ui + Tailwind CSS (UI компоненты)
- React Hook Form + Zod (формы и валидация)
- Vitest + React Testing Library (тестирование)
- React Compiler (оптимизация)
- ESLint + Prettier (линтинг и форматирование)

### Бэкенд

- Node.js + Express
- SQLite (база данных)
- Drizzle ORM (работа с БД)
- JWT (аутентификация)
- bcryptjs (хеширование паролей)
- Zod (валидация данных)

## Быстрый старт

### Установка зависимостей

```bash
# Установить зависимости корневого проекта
npm install

# Установить зависимости фронтенда
cd frontend
npm install

# Установить зависимости бэкенда
cd ../backend
npm install
```

### Запуск в режиме разработки

```bash
# Из корня проекта - запуск фронтенда и бэкенда одновременно
npm run dev

# Или по отдельности:
# Терминал 1 - Бэкенд
cd backend
npm run dev

# Терминал 2 - Фронтенд
cd frontend
npm run dev
```

### Инициализация базы данных

```bash
cd backend

# Генерация миграций
npm run db:generate

# Применение миграций
npm run db:migrate

# Заполнение тестовыми данными (создаёт администратора)
npm run db:seed
```

**Данные для входа по умолчанию:**

- Email: `admin@polanet.local`
- Пароль: `admin123`

## Структура проекта

```
polanet/
├── frontend/          # React приложение
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/    # shadcn/ui компоненты
│   │   ├── routes/    # TanStack Router роуты
│   │   ├── pages/     # Страницы приложения
│   │   ├── lib/       # Утилиты, API, контексты
│   │   └── styles/    # Глобальные стили
│   ├── vitest.config.ts  # Конфигурация Vitest
│   └── package.json
├── backend/           # Express API
│   ├── src/
│   │   ├── db/        # База данных и схемы
│   │   ├── routes/    # API endpoints
│   │   └── middleware/# Auth, валидаторы
│   ├── data/          # SQLite файл + бэкапы
│   └── package.json
└── package.json
```

## Страницы приложения

| Страница           | URL                | Описание                         |
| ------------------ | ------------------ | -------------------------------- |
| Главная            | `/`                | Главная страница                 |
| Пользователи       | `/users`           | CRUD пользователей               |
| Роли               | `/roles`           | CRUD ролей                       |
| Заявки             | `/orders`          | CRUD заявок                      |
| Автомобили         | `/cars`            | CRUD автомобилей                 |
| Водители           | `/drivers`         | CRUD водителей                   |
| Клиенты            | `/clients`         | CRUD клиентов                    |
| Транспортные карты | `/transport-cards` | Управление транспортными картами |
| Резервные копии    | `/backups`         | Управление бэкапами БД           |

## API Endpoints

### Аутентификация

| Метод | Endpoint             | Описание             |
| ----- | -------------------- | -------------------- |
| POST  | `/api/auth/login`    | Вход                 |
| POST  | `/api/auth/register` | Регистрация          |
| GET   | `/api/auth/me`       | Текущий пользователь |
| POST  | `/api/auth/logout`   | Выход                |

### Пользователи

| Метод  | Endpoint         | Описание              |
| ------ | ---------------- | --------------------- |
| GET    | `/api/users`     | Список пользователей  |
| GET    | `/api/users/:id` | Пользователь по ID    |
| POST   | `/api/users`     | Создать пользователя  |
| PUT    | `/api/users/:id` | Обновить пользователя |
| DELETE | `/api/users/:id` | Удалить пользователя  |

### Роли

| Метод  | Endpoint         | Описание      |
| ------ | ---------------- | ------------- |
| GET    | `/api/roles`     | Список ролей  |
| GET    | `/api/roles/:id` | Роль по ID    |
| POST   | `/api/roles`     | Создать роль  |
| PUT    | `/api/roles/:id` | Обновить роль |
| DELETE | `/api/roles/:id` | Удалить роль  |

### Заявки

| Метод  | Endpoint          | Описание        |
| ------ | ----------------- | --------------- |
| GET    | `/api/orders`     | Список заявок   |
| GET    | `/api/orders/:id` | Заявка по ID    |
| POST   | `/api/orders`     | Создать заявку  |
| PUT    | `/api/orders/:id` | Обновить заявку |
| DELETE | `/api/orders/:id` | Удалить заявку  |

### Транспортные карты

| Метод  | Endpoint                   | Описание       |
| ------ | -------------------------- | -------------- |
| GET    | `/api/transport-cards`     | Список карт    |
| GET    | `/api/transport-cards/:id` | Карта по ID    |
| POST   | `/api/transport-cards`     | Создать карту  |
| PUT    | `/api/transport-cards/:id` | Обновить карту |
| DELETE | `/api/transport-cards/:id` | Удалить карту  |

### Резервные копии

| Метод  | Endpoint                         | Описание               |
| ------ | -------------------------------- | ---------------------- |
| GET    | `/api/backups`                   | Список бэкапов         |
| POST   | `/api/backups`                   | Создать бэкап          |
| POST   | `/api/backups/:filename/restore` | Восстановить из бэкапа |
| DELETE | `/api/backups/:filename`         | Удалить бэкап          |

## Тестирование

Для модульного тестирования фронтенда используется **Vitest** + **React Testing Library**.

### Запуск тестов

```bash
cd frontend

# Запуск в watch режиме (для разработки)
npm run test

# Запуск один раз
npm run test:run

# Запуск с UI (опционально, требует @vitest/ui)
npm run test:ui
```

### Структура тестов

```
frontend/
├── vitest.config.ts       # Конфигурация Vitest
├── src/
│   ├── test/
│   │   └── setup.ts       # Глобальная настройка (моки)
│   └── ...
│   ├── lib/
│   │   └── utils.test.ts  # Тесты утилит
│   └── components/
│       └── ui/
│           └── button.test.tsx  # Тесты компонентов
```

### Написание тестов

**Важно:** Vitest globals (`describe`, `it`, `expect`, `vi`) доступны глобально. НЕ импортируйте их напрямую из `vitest`:

```typescript
// ✅ Правильно - используем globals
describe("My feature", () => {
  it("should work", () => {
    expect(1 + 1).toBe(2);
  });
});

// ❌ Неправильно
import { describe, it, expect } from "vitest";
```

### Примеры тестов

- [`src/lib/utils.test.ts`](src/lib/utils.test.ts) - тесты утилиты `cn` (9 тестов)
- [`src/lib/types/transport-card-types.test.ts`](src/lib/types/transport-card-types.test.ts) - тесты Zod схем (12 тестов)
- [`src/components/ui/button.test.tsx`](src/components/ui/button.test.tsx) - тесты Button компонента (14 тестов)

**Итого:** 35 тестов в 3 тестовых файлах.

## Pre-commit хук

Перед каждым коммитом автоматически выполняются:

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

## Развертывание на Selectel

1. Создайте VM на Selectel (Ubuntu 22.04)
2. Установите Node.js 20+
3. Склонируйте репозиторий
4. Установите зависимости
5. Инициализируйте БД
6. Настройте PM2 для управления процессами

```bash
# Установка PM2
npm install -g pm2

# Запуск бэкенда
cd backend
pm2 start npm --name "polanet-api" -- start

# Сборка фронтенда
cd frontend
npm run build
pm2 serve dist/ 80 --name "polanet-frontend"
```

## Лицензия

ISC
