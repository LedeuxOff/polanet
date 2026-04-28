-- Исправление кода права users:sendPassword
-- Было: users:send-password (неверный формат)
-- Стало: users:sendPassword (camelCase, соответствует бэкенду)

UPDATE permissions SET code = 'users:sendPassword' WHERE code = 'users:send-password';

-- Проверка результата
SELECT id, code, name, module FROM permissions WHERE code = 'users:sendPassword';
