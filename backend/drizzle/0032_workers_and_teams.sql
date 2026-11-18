-- Миграция: роль «Рабочий» (WORKER) и состав бригад

INSERT INTO roles (code, name) VALUES ('WORKER', 'Рабочий')
ON CONFLICT(code) DO NOTHING;

INSERT INTO permissions (module, code, name) VALUES
    ('workers', 'workers:list', 'Просмотр списка рабочих'),
    ('workers', 'workers:detail', 'Просмотр рабочего'),
    ('workers', 'workers:create', 'Создание рабочего'),
    ('workers', 'workers:update', 'Редактирование рабочего'),
    ('workers', 'workers:delete', 'Удаление рабочего'),
    ('works', 'teams:list', 'Просмотр списка бригад'),
    ('works', 'teams:detail', 'Просмотр бригады')
ON CONFLICT(code) DO NOTHING;

-- Все права на рабочих и бригады — ADMIN и DEVELOPER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code IN ('ADMIN', 'DEVELOPER')
  AND (p.module = 'workers' OR p.code IN ('teams:list', 'teams:detail', 'teams:manage'))
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Просмотр — USER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'USER'
  AND p.code IN ('workers:list', 'workers:detail', 'teams:list', 'teams:detail')
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Бригада рабочего (последним: при повторном запуске падает на duplicate column и пропускается)
ALTER TABLE users ADD COLUMN team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
