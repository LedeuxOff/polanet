-- Исправление дат, сохранённых строкой "CURRENT_TIMESTAMP" вместо времени
-- (drizzle .default("CURRENT_TIMESTAMP") подставлял литерал при вставке).
-- created_at берём из updated_at, если оно валидно, иначе — текущее время.

UPDATE roles SET created_at = COALESCE(NULLIF(updated_at, 'CURRENT_TIMESTAMP'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE created_at = 'CURRENT_TIMESTAMP';
UPDATE roles SET updated_at = created_at WHERE updated_at = 'CURRENT_TIMESTAMP';

UPDATE permissions SET created_at = COALESCE(NULLIF(updated_at, 'CURRENT_TIMESTAMP'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE created_at = 'CURRENT_TIMESTAMP';
UPDATE permissions SET updated_at = created_at WHERE updated_at = 'CURRENT_TIMESTAMP';

UPDATE role_permissions SET created_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE created_at = 'CURRENT_TIMESTAMP';

UPDATE users SET created_at = COALESCE(NULLIF(updated_at, 'CURRENT_TIMESTAMP'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE created_at = 'CURRENT_TIMESTAMP';
UPDATE users SET updated_at = created_at WHERE updated_at = 'CURRENT_TIMESTAMP';

UPDATE sessions SET created_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE created_at = 'CURRENT_TIMESTAMP';

UPDATE cars SET created_at = COALESCE(NULLIF(updated_at, 'CURRENT_TIMESTAMP'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE created_at = 'CURRENT_TIMESTAMP';
UPDATE cars SET updated_at = created_at WHERE updated_at = 'CURRENT_TIMESTAMP';

UPDATE clients SET created_at = COALESCE(NULLIF(updated_at, 'CURRENT_TIMESTAMP'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE created_at = 'CURRENT_TIMESTAMP';
UPDATE clients SET updated_at = created_at WHERE updated_at = 'CURRENT_TIMESTAMP';

UPDATE transport_cards SET updated_at = created_at WHERE updated_at = 'CURRENT_TIMESTAMP';

UPDATE recipient_history SET created_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE created_at = 'CURRENT_TIMESTAMP';
