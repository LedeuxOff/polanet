-- Миграция: раздел «Рабочие» удалён, рабочие ведутся как сотрудники — права workers:* больше не нужны
DELETE FROM role_permissions WHERE permission_id IN (SELECT id FROM permissions WHERE module = 'workers');
DELETE FROM permissions WHERE module = 'workers';
