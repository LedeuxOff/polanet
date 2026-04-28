-- Add deliveries management permissions
INSERT INTO permissions (module, code, name) VALUES
    ('deliveries', 'deliveries:list', 'Просмотр доставок'),
    ('deliveries', 'deliveries:detail', 'Просмотр details доставки'),
    ('deliveries', 'deliveries:create', 'Создание доставки'),
    ('deliveries', 'deliveries:update', 'Обновление доставки'),
    ('deliveries', 'deliveries:delete', 'Удаление доставки'),
    ('deliveries', 'deliveries:complete', 'Завершение доставки')
ON CONFLICT(code) DO NOTHING;
