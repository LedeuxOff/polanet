-- Добавление права на очистку серверных логов
INSERT OR IGNORE INTO permissions (code, name, module, description) VALUES
    ('system-logs:clear', 'Очистка серверных логов', 'system-logs', 'Доступ к очистке серверных логов ошибок');

-- Добавление права system-logs:clear к роли администратора (role_id = 1)
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, p.id
FROM permissions p
WHERE p.code = 'system-logs:clear';
