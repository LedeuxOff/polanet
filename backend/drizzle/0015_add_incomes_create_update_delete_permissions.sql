-- Add incomes create, update, delete permissions
INSERT INTO permissions (module, code, name) VALUES
    ('incomes', 'incomes:create', 'Создание дохода'),
    ('incomes', 'incomes:update', 'Обновление дохода'),
    ('incomes', 'incomes:delete', 'Удаление дохода')
ON CONFLICT(code) DO NOTHING;
