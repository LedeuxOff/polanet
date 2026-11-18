-- Права на страницы аналитики (модуль «Статистика»)
INSERT INTO permissions (module, code, name) VALUES
    ('statistics', 'statistics:operations', 'Статистика по заявкам и доставкам'),
    ('statistics', 'statistics:works', 'Статистика по стяжке')
ON CONFLICT(code) DO NOTHING;

-- По умолчанию — ADMIN и DEVELOPER; остальным выдаётся в «Ролях»
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code IN ('ADMIN', 'DEVELOPER')
  AND p.code IN ('statistics:operations', 'statistics:works')
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
