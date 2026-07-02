-- Добавляем разрешения templates
-- Выполнить: sqlite3 /app/data/polanet.db < add-templates-permissions.sql

-- 1. Добавляем разрешения если их нет
INSERT OR IGNORE INTO permissions (module, code, name) VALUES ('templates', 'templates:list', 'Просмотр списка шаблонов');
INSERT OR IGNORE INTO permissions (module, code, name) VALUES ('templates', 'templates:create', 'Создание шаблона');
INSERT OR IGNORE INTO permissions (module, code, name) VALUES ('templates', 'templates:delete', 'Удаление шаблона');

-- 2. Получаем ID разрешений и назначаем на роли ADMIN и DEVELOPER
-- Используем подзапросы для получения ID

-- ADMIN role permissions
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'ADMIN'
  AND p.module = 'templates'
  AND p.code IN ('templates:list', 'templates:create', 'templates:delete');

-- DEVELOPER role permissions
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'DEVELOPER'
  AND p.module = 'templates'
  AND p.code IN ('templates:list', 'templates:create', 'templates:delete');
