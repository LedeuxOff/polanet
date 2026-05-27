# Применение изменений Telegram Bot + Network Fix

## Изменения

1. **docker-compose.yml** — добавлены переменные Telegram Bot
2. **docker-compose.yml** — переключено на `network_mode: host` (исправляет проблему с подключением к Telegram API)
3. **Dockerfile** — обновлён для корректной работы

## Команды

```bash
cd ~/polanet
git pull origin master
docker compose down
docker compose up -d
docker compose logs -f backend
```

## Ожидаемый результат

В логах должно быть:

```
[Telegram Bot] Webhook установлен успешно
[Telegram Bot] Bot started successfully
🚀 Сервер запущен на http://localhost:3000
```
