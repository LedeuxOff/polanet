-- Добавление прав на управление резервными копиями
INSERT OR IGNORE INTO permissions (code, name, module, description) VALUES
    ('backups:create', 'Создание резервных копий', 'backups', 'Доступ к созданию новых резервных копий'),
    ('backups:restore', 'Восстановление из резервных копий', 'backups', 'Доступ к восстановлению базы данных из резервных копий'),
    ('backups:delete', 'Удаление резервных копий', 'backups', 'Доступ к удалению резервных копий');

-- Добавление прав backups к роли администратора (role_id = 1)
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, p.id
FROM permissions p
WHERE p.code IN ('backups:create', 'backups:restore', 'backups:delete');
