-- Add system-logs:view permission (for route-level guard)
INSERT INTO permissions (module, code, name) VALUES
    ('system-logs', 'system-logs:view', 'Просмотр системных логов')
ON CONFLICT(code) DO NOTHING;
