CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  expense_type TEXT NOT NULL,
  payment_type TEXT NOT NULL,
  transport_card_id INTEGER,
  driver_id INTEGER,
  date_time TEXT NOT NULL,
  amount INTEGER NOT NULL,
  comment TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (transport_card_id) REFERENCES transport_cards(id) ON UPDATE no action ON DELETE set null,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON UPDATE no action ON DELETE set null
);
