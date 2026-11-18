-- Миграция: Календарь работ (стяжка) — бригады и работы

CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name TEXT NOT NULL,
  is_active INTEGER DEFAULT 1 NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  legacy_id INTEGER UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS works (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  date TEXT NOT NULL,
  team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  address TEXT,
  area REAL,
  thickness REAL,
  strength TEXT,
  work_type TEXT DEFAULT 'standard' NOT NULL,
  hose_length REAL,
  is_transmix INTEGER DEFAULT 0 NOT NULL,
  price INTEGER,
  is_final_price INTEGER DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'preliminary' NOT NULL,
  measurer_name TEXT,
  notes TEXT,
  legacy_id INTEGER UNIQUE,
  created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_works_date ON works(date);
CREATE INDEX IF NOT EXISTS idx_works_team_id ON works(team_id);
CREATE INDEX IF NOT EXISTS idx_works_client_id ON works(client_id);

INSERT INTO permissions (module, code, name) VALUES
    ('works', 'works:list', 'Просмотр календаря работ'),
    ('works', 'works:detail', 'Просмотр деталей работы'),
    ('works', 'works:create', 'Создание работы'),
    ('works', 'works:update', 'Редактирование работы'),
    ('works', 'works:delete', 'Удаление работы'),
    ('works', 'teams:manage', 'Управление бригадами')
ON CONFLICT(code) DO NOTHING;

-- Все права на работы — ADMIN и DEVELOPER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code IN ('ADMIN', 'DEVELOPER')
  AND p.module = 'works'
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Базовые права — USER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'USER'
  AND p.code IN ('works:list', 'works:detail', 'works:create', 'works:update')
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
