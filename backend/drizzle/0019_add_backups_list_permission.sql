-- Add backups:list permission (for route-level guard)
INSERT INTO permissions (module, code, name) VALUES
    ('backups', 'backups:list', 'Просмотр списка резервных копий')
ON CONFLICT(code) DO NOTHING;
