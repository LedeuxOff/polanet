-- Добавление полей для уведомлений клиентов и водителей
ALTER TABLE deliveries ADD COLUMN notify_client INTEGER NOT NULL DEFAULT 0;
ALTER TABLE deliveries ADD COLUMN notify_driver INTEGER NOT NULL DEFAULT 0;
