-- Миграция: время окончания работы. Работа в календаре — блок от start_time до end_time.
-- Понятия «весь день» нет: работы без времени (импорт из старой системы) растягиваем
-- на весь рабочий диапазон календаря 08:00–23:00.
ALTER TABLE works ADD COLUMN end_time TEXT;

UPDATE works SET start_time = '08:00', end_time = '23:00'
WHERE start_time IS NULL;

-- Работам, у которых было только начало, ставим окончание через час (не позже 23:00)
UPDATE works
SET end_time = CASE
  WHEN CAST(substr(start_time, 1, 2) AS INTEGER) >= 22 THEN '23:00'
  ELSE printf('%02d:%s', CAST(substr(start_time, 1, 2) AS INTEGER) + 1, substr(start_time, 4, 2))
END
WHERE end_time IS NULL;
