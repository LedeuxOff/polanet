-- Add permissions management permissions
INSERT INTO permissions (module, code, name) VALUES
    ('permissions', 'permissions:list', 'Просмотр списка прав'),
    ('permissions', 'permissions:manage', 'Управление правами ролей')
ON CONFLICT(code) DO NOTHING;
