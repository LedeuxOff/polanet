# Первоначальная настройка проекта (Polanet)

Эта инструкция поможет вам настроить проект на новом компьютере.

## Требования

- Node.js 18+ установлен
- npm или yarn пакетный менеджер

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

При необходимости измените значения в файле `.env`:

- `PORT` - порт сервера (по умолчанию 3000)
- `JWT_SECRET` - секретный ключ для JWT (измените в продакшене!)
- `SMS_API_KEY` - ключ SMS API (если используется)

## Шаг 3: Создание базы данных и применение миграций

```bash
npm run db:migrate
```

Эта команда создаст базу данных в файле `data/polanet.db` и применит все миграции.

## Шаг 4: Заполнение начальными данными (seed)

```bash
npm run db:seed
```

Эта команда создаст:

### Роли:

- **ADMIN** (Администратор) - с всеми правами доступа
- **DEVELOPER** (Разработчик) - со всеми правами доступа

### Пользователей:

- **admin@test.com** / пароль: `test`
- **developer@test.com** / пароль: `test`

## Шаг 5: Запуск backend сервера

```bash
npm run dev
```

Сервер запустится на `http://localhost:3000`

## Шаг 6: Установка зависимостей frontend

Откройте новый терминал:

```bash
cd frontend
npm install
```

## Шаг 7: Запуск frontend

```bash
npm run dev
```

Фронтенд запустится на `http://localhost:5173`

## Итого

После выполнения всех шагов:

- Backend работает на `http://localhost:3000`
- Frontend работает на `http://localhost:5173`
- Для входа используйте:
  - Email: `admin@test.com`
  - Пароль: `test`

## Переустановка/сброс базы данных

Если нужно сбросить базу данных:

```bash
cd backend
# Удалить существующую базу данных
rm data/polanet.db
# Применить миграции заново
npm run db:migrate
# Заполнить начальными данными
npm run db:seed
```

## Решение проблем

### Ошибка 401 при входе (POST /login)

Если при входе возвращается 401 Unauthorized:

1. Проверьте, что пользователи созданы:

   ```bash
   node -e "const db = require('better-sqlite3')('data/polanet.db'); console.log(db.prepare('SELECT u.email, r.name FROM users u JOIN roles r ON u.roleId = r.id').all());"
   ```

2. Если пользователи не созданы - запустите seed:

   ```bash
   npm run db:seed
   ```

3. Если пользователи есть, но вход не работает - пересоздайте пароль:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); const db = require('better-sqlite3')('data/polanet.db'); const hash = bcrypt.hashSync('test', 10); db.prepare('UPDATE users SET passwordHash = ? WHERE email = ?').run(hash, 'admin@test.com'); console.log('Password reset for admin@test.com');"
   ```

### Ошибка "no such table"

Нужно применить миграции:

```bash
npm run db:migrate
```

### Ошибка "no such column"

Нужно применить миграции:

```bash
npm run db:migrate
```
