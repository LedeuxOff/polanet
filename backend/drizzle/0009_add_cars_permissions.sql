-- Add cars management permissions
INSERT INTO permissions (module, code, name) VALUES
    ('cars', 'cars:list', 'Просмотр автомобилей'),
    ('cars', 'cars:detail', 'Просмотр details автомобиля'),
    ('cars', 'cars:create', 'Создание автомобиля'),
    ('cars', 'cars:update', 'Обновление автомобиля'),
    ('cars', 'cars:delete', 'Удаление автомобиля')
ON CONFLICT(code) DO NOTHING;
