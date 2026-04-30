-- Add system-info:view permission (for route-level guard)
INSERT INTO permissions (module, code, name) VALUES
    ('system-info', 'system-info:view', 'Просмотр информации о системе')
ON CONFLICT(code) DO NOTHING;
