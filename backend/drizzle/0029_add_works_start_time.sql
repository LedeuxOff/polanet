-- Миграция: время начала работы (сетка календаря работ по часам 08:00–23:00)
-- NULL — работа на весь день (так импортированы все работы из старой системы)
ALTER TABLE works ADD COLUMN start_time TEXT;
CREATE INDEX IF NOT EXISTS idx_works_date_time ON works(date, start_time);
