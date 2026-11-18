-- Миграция: отдельная сущность «Клиенты стяжки» (раздел «Стяжка»)

CREATE TABLE IF NOT EXISTS screed_clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  last_name TEXT,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  phone TEXT,
  notes TEXT,
  -- id клиента в таблице clients, из которого перенесена запись (служебное, для переноса)
  source_client_id INTEGER UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_screed_clients_phone ON screed_clients(phone);

INSERT INTO permissions (module, code, name) VALUES
    ('screed-clients', 'screed-clients:list', 'Просмотр списка клиентов стяжки'),
    ('screed-clients', 'screed-clients:detail', 'Просмотр клиента стяжки'),
    ('screed-clients', 'screed-clients:create', 'Создание клиента стяжки'),
    ('screed-clients', 'screed-clients:update', 'Редактирование клиента стяжки'),
    ('screed-clients', 'screed-clients:delete', 'Удаление клиента стяжки')
ON CONFLICT(code) DO NOTHING;

-- Права выдаём тем ролям, у которых есть аналогичные права на обычных клиентов
INSERT INTO role_permissions (role_id, permission_id)
SELECT rp.role_id, sp.id
FROM role_permissions rp
JOIN permissions cp ON cp.id = rp.permission_id AND cp.module = 'clients'
JOIN permissions sp ON sp.code = 'screed-' || cp.code
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions x WHERE x.role_id = rp.role_id AND x.permission_id = sp.id
);

-- Ссылка работы на клиента стяжки (последним: при повторном запуске падает на duplicate column и пропускается)
ALTER TABLE works ADD COLUMN screed_client_id INTEGER REFERENCES screed_clients(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_works_screed_client_id ON works(screed_client_id);
