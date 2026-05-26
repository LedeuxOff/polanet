# Развёртывание Polanet на Ubuntu 24.04 LTS

Эта инструкция предназначена для развёртывания проекта Polanet на новом сервере Ubuntu 24.04 LTS с root пользователем.

## Шаг 1: Установка зависимостей

```bash
# Обновляем систему
apt update && apt upgrade -y

# Устанавливаем Docker, Nginx, Git и другие необходимые пакеты
apt install -y docker.io docker-compose-plugin nginx git curl certbot python3-certbot-nginx

# Запускаем Docker
systemctl start docker
systemctl enable docker

# Проверяем установку
docker --version
docker compose version
```

## Шаг 2: Клонирование репозитория

```bash
# Переходим в домашнюю директорию
cd /root

# Клонируем репозиторий (замени URL на свой)
git clone https://github.com/your-username/your-repo.git polanet

# Переходим в директорию проекта
cd polanet
```

## Шаг 3: Настройка окружения

```bash
# Переходим в директорию backend
cd backend

# Копируем пример окружения в продакшен файл
cp .env.example .env.production

# Редактируем файл окружения
nano .env.production
```

В файле `.env.production` нужно изменить следующие значения:

```bash
# Порт сервера
PORT=3000

# Секретный ключ для JWT (ОБЯЗАТЕЛЬНО сгенерируйте свой!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Автоматическое резервное копирование
AUTO_BACKUP=true
AUTO_BACKUP_INTERVAL=3600000
AUTO_BACKUP_MAX_COUNT=24

# Telegram Bot API (если нужен)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
TELEGRAM_BOT_USERNAME=your-bot-username
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook

# Путь к базе данных
DATABASE_PATH=/app/data/polanet.db

# CORS - разрешенные домены
CORS_ORIGIN=https://your-domain.com

# Логирование
LOG_LEVEL=error
```

Для генерации случайного JWT_SECRET можно использовать:

```bash
openssl rand -base64 32
```

## Шаг 4: Настройка SSL сертификата

```bash
# Убедитесь, что домен указывает на IP вашего сервера
# Запускаем Certbot для получения SSL сертификата
certbot --nginx -d your-domain.com -d www.your-domain.com

# Следуйте инструкциям на экране
# Certbot автоматически настроит Nginx для использования SSL
```

## Шаг 5: Настройка Nginx

```bash
# Копируем конфигурацию Nginx
cp nginx/nginx.conf /etc/nginx/nginx.conf

# Проверяем конфигурацию
nginx -t

# Перезапускаем Nginx
systemctl restart nginx
systemctl enable nginx
```

## Шаг 6: Запуск с Docker Compose

```bash
# Переходим в корень проекта
cd /root/polanet

# Запускаем контейнеры
docker compose up -d

# Проверяем статус контейнеров
docker ps

# Проверяем логи
docker logs -f polanet-backend
```

## Шаг 7: Проверка работы

```bash
# Проверяем здоровье бэкенда
curl http://localhost:3000/api/health

# Открываем браузер и переходим на https://your-domain.com
```

## Шаг 8: Настройка автоматического запуска

```bash
# Создаём systemd сервис для автоматического запуска Docker контейнеров
nano /etc/systemd/system/polanet.service
```

Содержимое файла:

```ini
[Unit]
Description=Polanet Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/root/polanet
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
Restart=no

[Install]
WantedBy=multi-user.target
```

```bash
# Перезагружаем daemon
systemctl daemon-reload

# Включаем автозапуск
systemctl enable polanet
```

## Шаг 9: Настройка брандмауэра (опционально)

```bash
# Устанавливаем ufw
apt install -y ufw

# Разрешаем необходимые порты
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

# Включаем брандмауэр
ufw enable
```

## Шаг 10: Настройка Telegram бота (опционально)

Если вам нужны уведомления в Telegram:

1. Откройте Telegram и найдите @BotFather
2. Используйте команду `/newbot` для создания нового бота
3. Следуйте инструкциям и получите токен
4. Найдите @userinfobot и получите свой Chat ID
5. Добавьте токен и Chat ID в файл `.env.production`

## Проверка статуса

```bash
# Проверяем все сервисы
systemctl status polanet
docker ps
journalctl -u polanet -f
```

## Резервное копирование

```bash
# Ручное резервное копирование базы данных
docker exec -it polanet-backend npm run db:backup

# Список резервных копий
docker exec -it polanet-backend npm run db:backup:list
```

## Устранение неполадок

Если что-то не работает:

```bash
# Проверяем логи бэкенда
docker logs polanet-backend

# Проверяем логи Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Проверяем статус Docker контейнеров
docker ps -a

# Перезапускаем контейнеры
docker compose restart
```

## Справочные команды

```bash
# Остановить все сервисы
docker compose down

# Перезапустить все сервисы
docker compose restart

# Пересобрать и перезапустить
docker compose up -d --build

# Удалить все контейнеры и volumes
docker compose down -v

# Посмотреть логи в реальном времени
docker compose logs -f

# Войти в контейнер бэкенда
docker exec -it polanet-backend bash

# Войти в контейнер Nginx
docker exec -it polanet-nginx bash
```
