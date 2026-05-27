# Инструкции по перезапуску на сервере

## Изменения:

1. Добавлен `proxy-agent` для работы Telegram бота через прокси
2. Настроены переменные окружения для прокси (HTTP_PROXY, HTTPS_PROXY)

## Команды для выполнения на сервере:

```bash
cd ~/polanet

# 1. Применить изменения из git
git pull origin master

# 2. Остановить контейнер
docker stop polanet-backend || true
docker rm polanet-backend || true

# 3. Пересобрать образ без кэша
docker compose build --no-cache

# 4. Запустить контейнер
docker compose up -d

# 5. Проверить статус
docker ps
docker compose logs -f

# 6. Проверить health check
curl -s http://localhost:3000/api/health

# 7. Проверить фронтенд
curl -s https://admin-polanet.ru | head -20

# 8. Проверить Telegram бота в логах
docker compose logs polanet-backend | grep "Telegram"
```

## Проверка прокси:

Если mihomo запущен, проверьте его статус:

```bash
systemctl status mihomo
```

Проверьте подключение к Telegram:

```bash
curl --max-time 10 https://api.telegram.org
```

## Переменные окружения прокси:

В `docker-compose.yml` настроены:

- `HTTP_PROXY=http://127.0.0.1:2017`
- `HTTPS_PROXY=http://127.0.0.1:2017`
- `NO_PROXY=localhost,127.0.0.1`

Если mihomo использует другой порт, измените в `docker-compose.yml`.
