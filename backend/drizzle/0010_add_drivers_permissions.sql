-- Add drivers management permissions
INSERT INTO permissions (module, code, name) VALUES
    ('drivers', 'drivers:list', 'Просмотр водителей'),
    ('drivers', 'drivers:detail', 'Просмотр details водителя'),
    ('drivers', 'drivers:create', 'Создание водителя'),
    ('drivers', 'drivers:update', 'Обновление водителя'),
    ('drivers', 'drivers:delete', 'Удаление водителя')
ON CONFLICT(code) DO NOTHING;
