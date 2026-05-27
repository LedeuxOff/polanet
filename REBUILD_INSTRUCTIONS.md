# Пересборка Docker образа на сервере

Выполните следующие команды на сервере Selectel:

```bash
# Перейти в проект
cd ~/polanet

# Зафолдить текущие изменения (если есть)
git pull origin master

# Пересобрать Docker образ без кэша
docker compose build --no-cache

# Перезапустить контейнер
docker compose down
docker compose up -d

# Проверить логи
docker compose logs -f backend

# Проверить health status
docker compose ps

# Проверить что фронтенд отдаётся
curl -s http://localhost:3000/ | head -20

# Проверить через Nginx
curl -s https://admin-polanet.ru | head -20
```

## Ожидаемый результат

- `docker compose ps` должен показать `healthy`
- `curl -s http://localhost:3000/` должен вернуть HTML фронтенда
- `curl -s https://admin-polanet.ru` должен вернуть HTML главной страницы
