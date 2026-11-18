-- Миграция: клиенты, привязанные к работам (импорт из старой системы стяжки), переносятся в screed_clients.
-- Повторный запуск ничего не меняет: после переноса у работ client_id = NULL.

INSERT INTO screed_clients (last_name, first_name, middle_name, phone, source_client_id, created_at, updated_at)
SELECT c.last_name,
       COALESCE(NULLIF(TRIM(COALESCE(c.first_name, c.organization_name, '')), ''), 'Без имени'),
       c.middle_name, c.phone, c.id,
       CASE WHEN c.created_at = 'CURRENT_TIMESTAMP' THEN datetime('now') ELSE c.created_at END,
       CASE WHEN c.updated_at = 'CURRENT_TIMESTAMP' THEN datetime('now') ELSE c.updated_at END
FROM clients c
WHERE c.id IN (SELECT client_id FROM works WHERE client_id IS NOT NULL)
  AND NOT EXISTS (SELECT 1 FROM screed_clients s WHERE s.source_client_id = c.id);

UPDATE works
SET screed_client_id = (SELECT s.id FROM screed_clients s WHERE s.source_client_id = works.client_id)
WHERE client_id IS NOT NULL AND screed_client_id IS NULL;

UPDATE works SET client_id = NULL WHERE screed_client_id IS NOT NULL;

-- Из обычных клиентов удаляем перенесённых, если на них больше ничего не ссылается
DELETE FROM clients
WHERE id IN (SELECT source_client_id FROM screed_clients WHERE source_client_id IS NOT NULL)
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.client_id = clients.id)
  AND NOT EXISTS (SELECT 1 FROM templates t WHERE t.client_id = clients.id)
  AND NOT EXISTS (SELECT 1 FROM works w WHERE w.client_id = clients.id);
