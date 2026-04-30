-- Добавление права на просмотр финансовой статистики
INSERT OR IGNORE INTO permissions (code, name, module, description) VALUES
    ('finances:view', 'Просмотр финансовой статистики', 'finances', 'Доступ к просмотру статистики по доходам и расходам');

-- Добавление права finances:view ко всем ролям
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE p.code = 'finances:view';