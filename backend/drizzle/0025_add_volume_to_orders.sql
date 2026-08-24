-- Миграция: Добавить поле volume (объем груза) в таблицу orders
-- Заменить dateTime на date

-- Добавляем новое поле volume (объем груза в м³)
ALTER TABLE orders ADD COLUMN volume INTEGER;

-- Добавляем колонку date
ALTER TABLE orders ADD COLUMN date text;

-- Копируем данные из date_time в date (берем только дату)
UPDATE orders SET date = substr(date_time, 1, 10);

-- Удаляем старую колонку date_time
ALTER TABLE orders DROP COLUMN date_time;
