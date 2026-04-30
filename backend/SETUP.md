# Первоначальная настройка проекта (Polanet)

## Требования

- Node.js 18+ установлен
- npm пакетный менеджер

## Шаг 1: Установка зависимостей backend

```bash
cd backend
npm install
```

## Шаг 2: Настройка переменных окружения

Создайте файл `.env` на основе примера:

```bash
cp .env.example .env
```

## Шаг 3: Применение миграций и заполнение БД

```bash
npm run db:migrate
npm run db:seed
```

Эти команды:

1. Создадут папку `data` если её нет
2. Применят все 21 миграцию (создадут все таблицы)
3. Создадут роли ADMIN и DEVELOPER
4. Назначат все права ролям
5. Создадут пользователей с паролем `test`

## Шаг 4: Запуск backend сервера

```bash
npm run dev
```

## Шаг 5: Установка зависимостей frontend

Откройте новый терминал:

```bash
cd frontend
npm install
```

## Шаг 6: Запуск frontend

```bash
npm run dev
```

## Итого

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`
- Логин: `admin@test.com` / пароль: `test`

## Сброс базы данных

```bash
cd backend
rm -rf data/polanet.db
npm run db:migrate
npm run db:seed
```
