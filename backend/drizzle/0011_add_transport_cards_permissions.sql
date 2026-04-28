-- Add transport cards management permissions
INSERT INTO permissions (module, code, name) VALUES
    ('transport-cards', 'transport-cards:list', 'Просмотр транспортных карт'),
    ('transport-cards', 'transport-cards:detail', 'Просмотр details транспортной карты'),
    ('transport-cards', 'transport-cards:create', 'Создание транспортной карты'),
    ('transport-cards', 'transport-cards:update', 'Обновление транспортной карты'),
    ('transport-cards', 'transport-cards:delete', 'Удаление транспортной карты')
ON CONFLICT(code) DO NOTHING;
