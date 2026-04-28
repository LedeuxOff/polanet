-- Добавление прав на управление ролями
INSERT OR IGNORE INTO permissions (code, name, module, description) VALUES
    ('roles:create', 'Создание ролей', 'roles', 'Доступ к созданию новых ролей'),
    ('roles:edit', 'Редактирование ролей', 'roles', 'Доступ к редактированию существующих ролей'),
    ('roles:delete', 'Удаление ролей', 'roles', 'Доступ к удалению ролей');

-- Добавление прав roles к роли администратора (role_id = 1)
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, p.id
FROM permissions p
WHERE p.code IN ('roles:create', 'roles:edit', 'roles:delete');
