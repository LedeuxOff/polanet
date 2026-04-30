-- Add expenses create, update, delete permissions
INSERT INTO permissions (module, code, name) VALUES
    ('expenses', 'expenses:create', 'Создание расхода'),
    ('expenses', 'expenses:update', 'Обновление расхода'),
    ('expenses', 'expenses:delete', 'Удаление расхода')
ON CONFLICT(code) DO NOTHING;
