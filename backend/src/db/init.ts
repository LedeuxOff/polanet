import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sqlite = new Database('./data/polanet.db')
sqlite.pragma('journal_mode = wal')

const createTables = `
-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  birth_date TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand TEXT NOT NULL,
  license_plate TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  phone TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('individual', 'legal')),
  last_name TEXT,
  first_name TEXT,
  middle_name TEXT,
  organization_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('delivery', 'pickup')),
  address TEXT NOT NULL,
  cost INTEGER NOT NULL,
  payer_last_name TEXT NOT NULL,
  payer_first_name TEXT NOT NULL,
  payer_middle_name TEXT,
  receiver_last_name TEXT NOT NULL,
  receiver_first_name TEXT NOT NULL,
  receiver_middle_name TEXT,
  date_time TEXT NOT NULL,
  has_pass INTEGER NOT NULL DEFAULT 0,
  address_comment TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'in_progress', 'completed', 'cancelled', 'archived', 'draft')),
  payment_type TEXT NOT NULL CHECK(payment_type IN ('cash', 'bank_transfer')),
  client_id INTEGER REFERENCES clients(id),
  created_by_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  delivery_id INTEGER REFERENCES deliveries(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  payment_date TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'transfer' CHECK(type IN ('prepayment', 'transfer', 'delivery')),
  created_at TEXT NOT NULL
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
  driver_id INTEGER NOT NULL REFERENCES drivers(id),
  car_id INTEGER NOT NULL REFERENCES cars(id),
  date_time TEXT NOT NULL,
  cost INTEGER NOT NULL,
  volume INTEGER,
  comment TEXT,
  is_paid INTEGER NOT NULL DEFAULT 0,
  is_cash_payment INTEGER NOT NULL DEFAULT 0,
  is_unloading_before_unloading INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Order history table
CREATE TABLE IF NOT EXISTS order_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  created_at TEXT NOT NULL
);

-- Transport cards table
CREATE TABLE IF NOT EXISTS transport_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_number TEXT NOT NULL UNIQUE,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Transport card expenses table
CREATE TABLE IF NOT EXISTS transport_card_expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id INTEGER NOT NULL REFERENCES transport_cards(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_date TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Transport card history table
CREATE TABLE IF NOT EXISTS transport_card_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id INTEGER NOT NULL REFERENCES transport_cards(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  created_at TEXT NOT NULL
);
`

try {
  sqlite.exec(createTables)
  console.log('✅ Талицы успешно созданы!')
} catch (error) {
  console.error('❌ Ошибка при создании таблиц:', error)
} finally {
  sqlite.close()
}
