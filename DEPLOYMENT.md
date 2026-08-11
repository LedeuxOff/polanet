# Инструкция по деплою Polanet

Актуальная инструкция по развёртыванию проекта на облачном сервере (Ubuntu) и последующим обновлениям.

## Архитектура

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Browser  │────▶│   Nginx      │────▶│   Node.js    │
│           │     │ (80 / 443)   │     │ (PM2 :3000)  │
└──────────┘     └──────────────┘     └──────────────┘
                     │                    │
                     │              ┌──────────────┐
                     └─────────────▶│   SQLite     │
                                    │ (polanet.db) │
                                    └──────────────┘
```

**Стек:**

- Frontend: React 18 + Vite + TanStack Router (отдаётся Nginx как статика)
- Backend: Express.js + TypeScript (управляется через PM2)
- DB: SQLite + Drizzle ORM
- Reverse Proxy: Nginx + Let's Encrypt SSL

---

## 1. Подготовка сервера

```bash
# Обновление системы
apt update && apt upgrade -y

# Установка Node.js 20 LTS (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# ВАЖНО: Удалите системный npm, чтобы избежать конфликта зависимостей
apt remove -y npm

# Установка Node.js, Git и Nginx
apt install -y nodejs git nginx

# Проверка версий
node -v   # v20.x.x
npm -v    # 10.x.x
nginx -v  # 1.x.x
```

---

## 2. Загрузка проекта

```bash
mkdir -p /home/deploy/polanet
cd /home/deploy/polanet

# Вариант А: Через Git
git clone <URL_РЕПОЗИТОРИЯ> .

# Вариант Б: Через scp с локальной машины
# scp -r ./polanet/* deploy@<IP_СЕРВЕРА>:/home/deploy/polanet/
```

---

## 3. Сборка фронтенда

```bash
cd /home/deploy/polanet/frontend
npm ci
npm run build

# Проверка
ls dist/index.html
```

---

## 4. Настройка и сборка бэкенда

```bash
cd /home/deploy/polanet/backend

# Установка зависимостей (полная, т.к. нужна TypeScript для сборки)
npm ci

# Сборка
npm run build

# Создание .env файла
openssl rand -base64 32  # Скопируйте результат
```

Создайте файл `.env`:

```bash
cat > .env << 'EOF'
PORT=3000
NODE_ENV=production
JWT_SECRET=ВСТАВЬ_СГЕНЕРИРОВАННЫЙ_КЛЮЧ
CORS_ORIGIN=https://admin-polanet.ru
DATABASE_PATH=./data/polanet.db
AUTO_BACKUP=true
AUTO_BACKUP_INTERVAL=3600000
AUTO_BACKUP_MAX_COUNT=24
LOG_LEVEL=error
# TELEGRAM_BOT_TOKEN=
# TELEGRAM_CHAT_ID=
# TELEGRAM_WEBHOOK_URL=https://admin-polanet.ru/api/telegram/webhook
EOF
```

---

## 5. База данных

```bash
cd /home/deploy/polanet/backend

# Применение миграций
npm run db:migrate

# Заполнение начальными данными (ролями, правами, админом)
npm run db:seed
```

---

## 6. Запуск бэкенда (PM2)

```bash
# Установка PM2
npm install -g pm2

# Запуск приложения
pm2 start dist/index.js --name polanet-backend

# Сохранение списка процессов и настройка автозагрузки
pm2 save
pm2 startup  # Выполните команду, которую он выведет
```

Проверка:

```bash
curl http://localhost:3000/api/health
# Ожидаемый ответ: {"status":"ok","timestamp":"..."}
```

---

## 7. Настройка Nginx (HTTP)

Создайте конфигурацию без SSL (для первичной проверки и Certbot):

```bash
rm -f /etc/nginx/sites-enabled/default
cat > /etc/nginx/sites-available/admin-polanet.ru.conf << 'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name admin-polanet.ru;

    # API прокси
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Статика фронтенда
    root /home/deploy/polanet/frontend/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/admin-polanet.ru.conf /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
```

---

## 8. Настройка DNS (Selectel)

1. Узнай IP сервера: `curl -4 ifconfig.me`
2. В панели Selectel перейди в **DNS → Доменные зоны → Добавить зону** → `admin-polanet.ru`
3. Добавь A-запись:
   - Тип: `A`
   - Имя: `@` (или `admin-polanet.ru`)
   - Значение: `<IP_СЕРВЕРА>`
   - TTL: `3600`
4. В разделе **Домены** нажми три точки → **Изменить DNS-серверы**:
   - `a.ns.selectel.ru`
   - `b.ns.selectel.ru`
   - `c.ns.selectel.ru`
   - `d.ns.selectel.ru`
5. Подожди 5-10 минут и проверь:
   ```bash
   dig admin-polanet.ru +short
   # Должно вернуть IP сервера
   ```

---

## 9. SSL-сертификат (Certbot)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d admin-polanet.ru
```

Certbot автоматически обновит конфиг Nginx, добавит SSL и настроит редирект HTTP → HTTPS.

---

## 🔄 Пересборка и обновление проекта

Когда код обновлён (через `git pull` или загрузку файлов):

```bash
# 1. Обновить код на сервере
cd /home/deploy/polanet
git pull  # или загрузи новые файлы

# 2. Пересобрать фронтенд
cd frontend
npm ci && npm run build

# 3. Пересобрать бэкенд
cd ../backend
npm ci && npm run build

# 4. Применить новые миграции (если есть)
npm run db:migrate

# 5. Перезапустить бэкенд
pm2 restart polanet-backend

# 6. Проверить
curl -k https://admin-polanet.ru/api/health
```

**Быстрый скрипт обновления** (можно сохранить как `update.sh`):

```bash
#!/bin/bash
set -e
cd /home/deploy/polanet
git pull
cd frontend && npm ci && npm run build
cd ../backend && npm ci && npm run build && npm run db:migrate
pm2 restart polanet-backend
echo "✅ Обновление завершено!"
```

---

## Полезные команды

| Команда                       | Описание                        |
| ----------------------------- | ------------------------------- |
| `pm2 status`                  | Статус процессов бэкенда        |
| `pm2 logs polanet-backend`    | Логи бэкенда в реальном времени |
| `pm2 restart polanet-backend` | Перезапуск бэкенда              |
| `pm2 reload polanet-backend`  | Zero-downtime перезапуск        |
| `nginx -t`                    | Проверка конфига Nginx          |
| `systemctl restart nginx`     | Перезапуск Nginx                |
| `npm run db:backup`           | Создание бэкапа БД              |
| `npm run db:backup:list`      | Список бэкапов                  |
| `certbot renew --dry-run`     | Проверка автообновления SSL     |

---

## Тестовые данные (после seed)

| Роль          | Email                | Пароль |
| ------------- | -------------------- | ------ |
| Администратор | `admin@test.com`     | `test` |
| Разработчик   | `developer@test.com` | `test` |

⚠️ **Важно:** после первого входа обязательно смените пароли и удалите тестовые аккаунты!

---

## Устранение неполадок

### `npm ci --production` падает с ошибкой `husky: not found`

Используй `npm ci` без флага `--production` для сборки, так как `tsc` является dev-зависимостью. Для продакшена можно очистить `node_modules` после сборки:

```bash
npm ci && npm run build
rm -rf node_modules && npm ci --omit=dev --ignore-scripts
```

### Nginx ошибка `unknown directive "proxy_next_timeout"`

Директива `proxy_next_timeout` не поддерживается в стандартном Nginx. Удали её из конфига:

```bash
sed -i '/proxy_next_timeout/d' /etc/nginx/sites-enabled/admin-polanet.ru.conf
nginx -t && systemctl restart nginx
```

### Certbot: `DNS problem: SERVFAIL`

Домен не привязан к IP сервера. Проверь A-запись в DNS-зоне и делегирование через NS-серверы регистратора.

### Бэкенд не отвечает (502 Bad Gateway)

```bash
# Проверь, запущен ли PM2
pm2 status
# Проверь порт
curl http://localhost:3000/api/health
# Перезапусти при необходимости
pm2 restart polanet-backend
```
