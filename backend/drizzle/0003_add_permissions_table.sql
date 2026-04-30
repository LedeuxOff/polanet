-- Таблица прав доступа
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    module TEXT NOT NULL, -- users, orders, cars, etc.
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Таблица связей ролей с правами
CREATE TABLE IF NOT EXISTS role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    UNIQUE(role_id, permission_id)
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);

-- Вставка всех возможных прав
-- Права для модуля "users" (Пользователи)
INSERT OR IGNORE INTO permissions (code, name, module, description) VALUES
    ('users:list', 'Просмотр списка пользователей', 'users', 'Доступ к просмотру списка всех пользователей'),
    ('users:detail', 'Просмотр деталей пользователя', 'users', 'Доступ к просмотру полной информации о пользователе'),
    ('users:create', 'Создание пользователя', 'users', 'Доступ к созданию новых пользователей'),
    ('users:update', 'Редактирование пользователя', 'users', 'Доступ к редактированию информации о пользователе'),
    ('users:delete', 'Удаление пользователя', 'users', 'Доступ к удалению пользователей'),
    ('users:sendPassword', 'Сброс пароля пользователя', 'users', 'Доступ к функции отправки пароля пользователю');

-- Права для модуля "roles" (Роли)
INSERT OR IGNORE INTO permissions (code, name, module, description) VALUES 
    ('roles:list', 'Просмотр списка ролей', 'roles', 'Доступ к просмотру списка всех ролей'),
    ('roles:detail', 'Просмотр деталей роли', 'roles', 'Доступ к просмотру полной информации о роли'),
    ('roles:create', 'Создание роли', 'roles', 'Доступ к созданию новых ролей'),
    ('roles:update', 'Редактирование роли', 'roles', 'Доступ к редактированию информации о роли'),
    ('roles:delete', 'Удаление роли', 'roles', 'Доступ к удалению ролей');

-- Права для модуля "orders" (Заявки)
INSERT OR IGNORE INTO permissions (code, name, module, description) VALUES 
    ('orders:list', 'Просмотр списка заявок', 'orders', 'Доступ к просмотру списка всех заявок'),
    ('orders:detail', 'Просмотр деталей заявки', 'orders', 'Доступ к просмотру полной информации о заявке'),
    ('orders:create', 'Создание заявки', 'orders', 'Доступ к созданию новых заявок'),
    ('orders:update', 'Редактирование заявки', 'orders', 'Доступ к редактированию информации о заявке'),
    ('orders:delete', 'Удаление заявки', 'orders', 'Доступ к удалению заявок');

-- Права для модуля "clients" (Клиенты)
INSERT OR IGNORE INTO permissions (code, name, module, description) VALUES 
    ('clients:list', 'Просмотр списка клиентов', 'clients', 'Доступ к просмотру списка всех клиентов'),
    ('clients:detail', 'Просмотр деталей клиента', 'clients', 'Доступ к просмотру полной информации о клиенте'),
    ('clients:create', 'Создание клиента', 'clients', 'Доступ к созданию новых клиентов'),
    ('clients:update', 'Редактирование клиента', 'clients', 'Доступ к редактированию информации о клиенте'),
    ('clients:delete', 'Удаление клиента', 'clients', 'Доступ к удалению клиентов');

-- Права для модуля "cars" (Автомобили)
INSERT OR IGNORE INTO permissions (code, name, module, description) VALUES 
    ('cars:list', 'Просмотр списка автомобилей', 'cars', 'Доступ к просмотру списка всех автомобилей'),
    ('cars:detail', 'Просмотр деталей автомобиля', 'cars', 'Доступ к просмотру полной информации об автомобиле'),
    ('cars:create', 'Создание автомобиля', 'cars', 'Доступ к созданию новых автомобилей'),
    ('cars:update', 'Редактирование автомобиля', 'cars', 'Доступ к редактированию информации об автомобиле'),
    ('cars:delete', 'Удаление автомобиля', 'cars', 'Доступ к удалению автомобилей');

-- Права для модуля "drivers" (Водители)
INSERT OR IGNORE INTO permissions (code, name, module, description) VALUES 
    ('drivers:list', 'Просмотр списка водителей', 'drivers', 'Доступ к просмотру списка всех водителей'),
    ('drivers:detail', 'Просмотр деталей водителя', 'drivers', 'Доступ к просмотру полной информации о водителе'),
    ('drivers:create', 'Создание водителя', 'drivers', 'Доступ к созданию новых водителей'),
    ('drivers:update', 'Редактирование водителя', 'drivers', 'Доступ к редактированию информации о водителе'),
    ('drivers:delete', 'Удаление водителя', 'drivers', 'Доступ к удалению водителей');

-- Права для модуля "transport-cards" (Транспортные карты)
INSERT OR IGNORE INTO permissions (code, name, module, description) VALUES 
    ('transport-cards:list', 'Просмотр списка транспортных карт', 'transport-cards', 'Доступ к просмотру списка всех транспортных карт'),
    ('transport-cards:detail', 'Просмотр деталей карты', 'transport-cards', 'Доступ к просмотру полной информации о транспортной карте'),
    ('transport-cards:create', 'Создание карты', 'transport-cards', 'Доступ к созданию новых транспортных карт'),
    ('transport-cards:update', 'Редактирование карты', 'transport-cards', 'Доступ к редактированию информации о карте'),
    ('transport-cards:delete', 'Удаление карты', 'transport-cards', 'Доступ к удалению транспортных карт');

-- Права для модуля "deliveries" (Доставки)
INSERT OR IGNORE INTO permissions (code, name, module, description) VALUES 
    ('deliveries:list', 'Просмотр списка доставок', 'deliveries', 'Доступ к просмотру списка всех доставок'),
    ('deliveries:detail', 'Просмотр деталей доставки', 'deliveries', 'Доступ к просмотру полной информации о доставке'),
    ('deliveries:create', 'Создание доставки', 'deliveries', 'Доступ к созданию новых доставок'),
    ('deliveries:update', 'Редактирование доставки', 'deliveries', 'Доступ к редактированию информации о доставке'),
    ('deliveries:delete', 'Удаление доставки', 'deliveries', 'Доступ к удалению доставок');

-- Права для модуля "finances" (Финансы)
INSERT OR IGNORE INTO permissions (code, name, module, description) VALUES 
    ('incomes:list', 'Просмотр списка доходов', 'finances', 'Доступ к просмотру списка всех доходов'),
    ('incomes:create', 'Создание дохода', 'finances', 'Доступ к созданию новых доходов'),
    ('incomes:update', 'Редактирование дохода', 'finances', 'Доступ к редактированию информации о доходе'),
    ('incomes:delete', 'Удаление дохода', 'finances', 'Доступ к удалению доходов'),
    ('expenses:list', 'Просмотр списка расходов', 'finances', 'Доступ к просмотру списка всех расходов'),
    ('expenses:create', 'Создание расхода', 'finances', 'Доступ к созданию новых расходов'),
    ('expenses:update', 'Редактирование расхода', 'finances', 'Доступ к редактированию информации о расходе'),
    ('expenses:delete', 'Удаление расхода', 'finances', 'Доступ к удалению расходов');

-- Права для модуля "backups" (Резервные копии)
INSERT OR IGNORE INTO permissions (code, name, module, description) VALUES 
    ('backups:list', 'Просмотр списка резервных копий', 'backups', 'Доступ к просмотру списка всех резервных копий'),
    ('backups:create', 'Создание резервной копии', 'backups', 'Доступ к созданию новых резервных копий'),
    ('backups:delete', 'Удаление резервной копии', 'backups', 'Доступ к удалению резервных копий'),
    ('backups:restore', 'Восстановление из резервной копии', 'backups', 'Доступ к восстановлению из резервной копии');

-- Права для модуля "system-info" (Информация о системе)
INSERT OR IGNORE INTO permissions (code, name, module, description) VALUES 
    ('system-info:view', 'Просмотр информации о системе', 'system-info', 'Доступ к просмотру информации о системе');

-- Права для модуля "system-logs" (Логи системы)
INSERT OR IGNORE INTO permissions (code, name, module, description) VALUES 
    ('system-logs:view', 'Просмотр системных логов', 'system-logs', 'Доступ к просмотру системных логов'),
    ('system-logs:clear', 'Очистка системных логов', 'system-logs', 'Доступ к очистке системных логов');
