-- Миграция: Создать таблицу templates (Шаблоны заявок)

CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  type TEXT NOT NULL,
  address TEXT NOT NULL,
  payer_last_name TEXT NOT NULL,
  payer_first_name TEXT NOT NULL,
  payer_middle_name TEXT,
  payer_phone TEXT,
  receiver_last_name TEXT NOT NULL,
  receiver_first_name TEXT NOT NULL,
  receiver_middle_name TEXT,
  receiver_phone TEXT,
  date TEXT NOT NULL,
  volume INTEGER,
  has_pass INTEGER DEFAULT false NOT NULL,
  address_comment TEXT,
  client_id INTEGER,
  created_by_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (created_by_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action
);
