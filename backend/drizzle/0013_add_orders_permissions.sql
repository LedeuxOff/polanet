-- Add orders management permissions
INSERT INTO permissions (module, code, name) VALUES
    ('orders', 'orders:list', 'Просмотр заявок'),
    ('orders', 'orders:detail', 'Просмотр details заявки'),
    ('orders', 'orders:create', 'Создание заявки'),
    ('orders', 'orders:update', 'Обновление заявки'),
    ('orders', 'orders:delete', 'Удаление заявки'),
    ('orders', 'orders:payment', 'Управление выплатами по заявке')
ON CONFLICT(code) DO NOTHING;
