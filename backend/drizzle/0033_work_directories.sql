-- Миграция: справочники статусов и типов работ, замерщик-рабочий

CREATE TABLE IF NOT EXISTS work_statuses (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'blue' NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  show_in_calendar INTEGER DEFAULT 1 NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS work_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO work_statuses (code, name, color, sort_order, show_in_calendar, created_at, updated_at) VALUES
  ('preliminary', 'Предварительная дата', 'amber', 0, 1, datetime('now'), datetime('now')),
  ('measurement', 'Замер', 'violet', 1, 1, datetime('now'), datetime('now')),
  ('callback', 'Перезвонить', 'orange', 2, 1, datetime('now'), datetime('now')),
  ('scheduled', 'Выезд', 'blue', 3, 1, datetime('now'), datetime('now')),
  ('completed', 'Выполнено', 'green', 4, 1, datetime('now'), datetime('now')),
  ('deleted', 'Удалено', 'red', 5, 0, datetime('now'), datetime('now')),
  ('archived', 'Архив', 'zinc', 6, 0, datetime('now'), datetime('now'))
ON CONFLICT(code) DO NOTHING;

INSERT INTO work_types (code, name, sort_order, created_at, updated_at) VALUES
  ('standard', 'Стандартный', 0, datetime('now'), datetime('now')),
  ('machine_rent_with_team', 'Аренда станка с бригадой', 1, datetime('now'), datetime('now')),
  ('machine_rent', 'Аренда станка', 2, datetime('now'), datetime('now'))
ON CONFLICT(code) DO NOTHING;

-- «Отменён» больше нет — это «Удалено»
UPDATE works SET status = 'deleted' WHERE status = 'cancelled';

INSERT INTO permissions (module, code, name) VALUES
    ('works', 'directories:manage', 'Управление справочниками работ')
ON CONFLICT(code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code IN ('ADMIN', 'DEVELOPER') AND p.code = 'directories:manage'
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Замерщик-рабочий (последним: при повторном запуске падает на duplicate column и пропускается)
ALTER TABLE works ADD COLUMN measurer_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
