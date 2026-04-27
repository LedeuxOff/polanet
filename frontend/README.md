# TODO LIST

Быстрое создание заявок только с выбором клиента

Водителей и автомобилей может быть несколько

Оплату указывать для каждого водителя

Выбор оплаты наличные или перевод

Водители могут приезжать по одной заявке в разные дни

Аналог доставки

# Polanet Admin Panel

Fullstack приложение - административная панель для управления данными.

## Стек технологий

### Фронтенд

- React 18 + TypeScript
- TanStack Router (роутинг)
- TanStack Table (таблицы)
- shadcn/ui + Tailwind CSS (UI компоненты)
- React Hook Form + Zod (формы и валидация)

### Бэкенд

- Node.js + Express
- SQLite (база данных)
- Drizzle ORM (работа с БД)
- JWT (аутентификация)
- bcryptjs (хеширование паролей)

## Быстрый старт

### Установка зависимостей

```bash
# Исправить права npm (если нужно)
sudo chown -R 501:20 "/Users/nikitavodenikov/.npm"

# Установить зависимости корневого проекта
npm install

# Фронтенд
cd frontend
npm install

# Бэкенд
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
│   │   ├── lib/       # Утилиты, API, контексты
│   │   └── styles/    # Глобальные стили
│   └── package.json
├── backend/           # Express API
│   ├── src/
│   │   ├── db/        # База данных и схемы
│   │   ├── routes/    # API endpoints
│   │   └── middleware/# Auth, валидаторы
│   ├── data/          # SQLite файл
│   └── package.json
└── package.json
```

## API Endpoints

### Аутентификация

| Метод | Endpoint           | Описание             |
| ----- | ------------------ | -------------------- |
| POST  | /api/auth/login    | Вход                 |
| POST  | /api/auth/register | Регистрация          |
| GET   | /api/auth/me       | Текущий пользователь |
| POST  | /api/auth/logout   | Выход                |

### Пользователи

| Метод  | Endpoint       | Описание              |
| ------ | -------------- | --------------------- |
| GET    | /api/users     | Список пользователей  |
| GET    | /api/users/:id | Пользователь по ID    |
| POST   | /api/users     | Создать пользователя  |
| PUT    | /api/users/:id | Обновить пользователя |
| DELETE | /api/users/:id | Удалить пользователя  |

### Роли

| Метод | Endpoint   | Описание     |
| ----- | ---------- | ------------ |
| GET   | /api/roles | Список ролей |
| POST  | /api/roles | Создать роль |

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

## Сущности базы данных

### User (Пользователь)

- `id` - идентификатор
- `lastName` - фамилия
- `firstName` - имя
- `middleName` - отчество
- `birthDate` - дата рождения
- `email` - почта (уникальный)
- `phone` - телефон
- `passwordHash` - хеш пароля
- `roleId` - ссылка на роль
- `createdAt`, `updatedAt` - даты

### Role (Роль)

- `id` - идентификатор
- `code` - код роли (уникальный)
- `name` - название роли
- `createdAt`, `updatedAt` - даты

### Session (Сессия)

- `id` - идентификатор сессии
- `userId` - ссылка на пользователя
- `expiresAt` - дата истечения
- `createdAt` - дата создания

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
