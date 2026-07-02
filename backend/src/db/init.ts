import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlite = new Database("./data/polanet.db");
sqlite.pragma("journal_mode = wal");

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
  telegram_chat_id TEXT,
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
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
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
  payer_last_name TEXT,
  payer_first_name TEXT,
  payer_middle_name TEXT,
  payer_phone TEXT,
  receiver_last_name TEXT,
  receiver_first_name TEXT,
  receiver_middle_name TEXT,
  receiver_phone TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('delivery', 'pickup')),
  address TEXT NOT NULL,
  payer_last_name TEXT NOT NULL,
  payer_first_name TEXT NOT NULL,
  payer_middle_name TEXT,
  payer_phone TEXT,
  receiver_last_name TEXT NOT NULL,
  receiver_first_name TEXT NOT NULL,
  receiver_middle_name TEXT,
  receiver_phone TEXT,
  date_time TEXT NOT NULL,
  has_pass INTEGER NOT NULL DEFAULT 0,
  address_comment TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'in_progress', 'completed', 'cancelled', 'archived', 'draft')),
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
  driver_id INTEGER NOT NULL REFERENCES drivers(id),
  car_id INTEGER NOT NULL REFERENCES cars(id),
  date_time TEXT NOT NULL,
  volume INTEGER,
  comment TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK(payment_method IN ('cash', 'bank_transfer')),
  is_payment_before_unloading INTEGER NOT NULL DEFAULT 0,
  notify_client INTEGER NOT NULL DEFAULT 0,
  notify_driver INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK(status IN ('in_progress', 'completed')),
  income_id INTEGER,
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
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
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

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Incomes table
CREATE TABLE IF NOT EXISTS incomes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  income_type TEXT NOT NULL CHECK(income_type IN ('prepayment', 'delivery_payment')),
  payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'bank_transfer')),
  is_paid INTEGER NOT NULL DEFAULT 0,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_date TEXT NOT NULL,
  delivery_id INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  expense_type TEXT NOT NULL CHECK(expense_type IN ('salary', 'fuel')),
  payment_type TEXT NOT NULL CHECK(payment_type IN ('cash', 'bank_transfer')),
  transport_card_id INTEGER REFERENCES transport_cards(id) ON DELETE SET NULL,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  date_time TEXT NOT NULL,
  amount INTEGER NOT NULL,
  comment TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

async function initData() {
  try {
    sqlite.exec(createTables);
    console.log("✅ Таблицы успешно созданы!");

    // Check if admin already exists
    const existingAdmin = sqlite
      .prepare("SELECT id FROM users WHERE email = ?")
      .get("admin@polanet.local") as { id: number } | undefined;

    if (existingAdmin) {
      console.log("⚠️ Admin user already exists, skipping initialization...");
      sqlite.close();
      return;
    }

    console.log("\n🚀 Initializing database with roles, permissions, and admin user...\n");

    // 1. Create default roles
    const roles = [
      { code: "ADMIN", name: "Администратор" },
      { code: "USER", name: "Пользователь" },
      { code: "DEVELOPER", name: "Разработчик" },
    ];

    const roleIds: Record<string, number> = {};
    for (const role of roles) {
      const result = sqlite
        .prepare("INSERT INTO roles (code, name) VALUES (?, ?)")
        .run(role.code, role.name);
      roleIds[role.code] = result.lastInsertRowid as number;
      console.log(`✓ Created role: ${role.code} (${role.name}) - ID: ${roleIds[role.code]}`);
    }

    // 2. Create all permissions
    const permissions = [
      // Users permissions
      { module: "users", code: "users:list", name: "Просмотр списка пользователей" },
      { module: "users", code: "users:detail", name: "Просмотр деталей пользователя" },
      { module: "users", code: "users:create", name: "Создание пользователя" },
      { module: "users", code: "users:update", name: "Редактирование пользователя" },
      { module: "users", code: "users:delete", name: "Удаление пользователя" },
      { module: "users", code: "users:sendPassword", name: "Сброс пароля пользователя" },
      // Roles permissions
      { module: "roles", code: "roles:list", name: "Просмотр списка ролей" },
      { module: "roles", code: "roles:detail", name: "Просмотр деталей роли" },
      { module: "roles", code: "roles:create", name: "Создание роли" },
      { module: "roles", code: "roles:update", name: "Редактирование роли" },
      { module: "roles", code: "roles:delete", name: "Удаление роли" },
      { module: "roles", code: "permissions:manage", name: "Управление правами доступа" },
      // Orders permissions
      { module: "orders", code: "orders:list", name: "Просмотр списка заявок" },
      { module: "orders", code: "orders:detail", name: "Просмотр деталей заявки" },
      { module: "orders", code: "orders:create", name: "Создание заявки" },
      { module: "orders", code: "orders:update", name: "Обновление заявки" },
      { module: "orders", code: "orders:delete", name: "Удаление заявки" },
      // Clients permissions
      { module: "clients", code: "clients:list", name: "Просмотр списка клиентов" },
      { module: "clients", code: "clients:detail", name: "Просмотр деталей клиента" },
      { module: "clients", code: "clients:create", name: "Создание клиента" },
      { module: "clients", code: "clients:update", name: "Редактирование клиента" },
      { module: "clients", code: "clients:delete", name: "Удаление клиента" },
      // Cars permissions
      { module: "cars", code: "cars:list", name: "Просмотр списка автомобилей" },
      { module: "cars", code: "cars:detail", name: "Просмотр деталей автомобиля" },
      { module: "cars", code: "cars:create", name: "Создание автомобиля" },
      { module: "cars", code: "cars:update", name: "Редактирование автомобиля" },
      { module: "cars", code: "cars:delete", name: "Удаление автомобиля" },
      // Drivers permissions
      { module: "drivers", code: "drivers:list", name: "Просмотр списка водителей" },
      { module: "drivers", code: "drivers:detail", name: "Просмотр деталей водителя" },
      { module: "drivers", code: "drivers:create", name: "Создание водителя" },
      { module: "drivers", code: "drivers:update", name: "Редактирование водителя" },
      { module: "drivers", code: "drivers:delete", name: "Удаление водителя" },
      // Transport cards permissions
      {
        module: "transport-cards",
        code: "transport-cards:list",
        name: "Просмотр списка транспортных карт",
      },
      { module: "transport-cards", code: "transport-cards:detail", name: "Просмотр деталей карты" },
      { module: "transport-cards", code: "transport-cards:create", name: "Создание карты" },
      { module: "transport-cards", code: "transport-cards:update", name: "Редактирование карты" },
      { module: "transport-cards", code: "transport-cards:delete", name: "Удаление карты" },
      // Deliveries permissions
      { module: "deliveries", code: "deliveries:list", name: "Просмотр доставок" },
      { module: "deliveries", code: "deliveries:detail", name: "Просмотр деталей доставки" },
      { module: "deliveries", code: "deliveries:create", name: "Создание доставки" },
      { module: "deliveries", code: "deliveries:update", name: "Обновление доставки" },
      { module: "deliveries", code: "deliveries:delete", name: "Удаление доставки" },
      { module: "deliveries", code: "deliveries:complete", name: "Завершение доставки" },
      // Finances permissions
      { module: "finances", code: "incomes:list", name: "Просмотр списка доходов" },
      { module: "finances", code: "incomes:create", name: "Создание дохода" },
      { module: "finances", code: "incomes:update", name: "Редактирование дохода" },
      { module: "finances", code: "incomes:delete", name: "Удаление дохода" },
      { module: "finances", code: "expenses:list", name: "Просмотр списка расходов" },
      { module: "finances", code: "expenses:create", name: "Создание расхода" },
      { module: "finances", code: "expenses:update", name: "Редактирование расхода" },
      { module: "finances", code: "expenses:delete", name: "Удаление расхода" },
      { module: "finances", code: "finances:view", name: "Просмотр финансовой статистики" },
      // Backups permissions
      { module: "backups", code: "backups:list", name: "Просмотр списка резервных копий" },
      { module: "backups", code: "backups:create", name: "Создание резервной копии" },
      { module: "backups", code: "backups:delete", name: "Удаление резервной копии" },
      { module: "backups", code: "backups:restore", name: "Восстановление из резервной копии" },
      // System info permissions
      { module: "system-info", code: "system-info:view", name: "Просмотр информации о системе" },
      // System logs permissions
      { module: "system-logs", code: "system-logs:view", name: "Просмотр системных логов" },
      { module: "system-logs", code: "system-logs:clear", name: "Очистка системных логов" },
      // Templates permissions
      { module: "templates", code: "templates:list", name: "Просмотр списка шаблонов" },
      { module: "templates", code: "templates:create", name: "Создание шаблона" },
      { module: "templates", code: "templates:delete", name: "Удаление шаблона" },
    ];

    const permissionIds: Record<string, number> = {};
    for (const perm of permissions) {
      const result = sqlite
        .prepare("INSERT INTO permissions (module, code, name) VALUES (?, ?, ?)")
        .run(perm.module, perm.code, perm.name);
      permissionIds[perm.code] = result.lastInsertRowid as number;
    }
    console.log(`\n✓ Created ${permissions.length} permissions`);

    // 3. Assign all permissions to ADMIN role
    const adminPermInserts = Object.values(permissionIds).map((permId) =>
      sqlite
        .prepare("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)")
        .run(roleIds.ADMIN, permId),
    );
    await Promise.all(adminPermInserts);
    console.log(`\n✓ Assigned all ${permissions.length} permissions to ADMIN role`);

    // 4. Assign some permissions to USER role (basic operations)
    const userPermissions = [
      "orders:list",
      "orders:detail",
      "orders:create",
      "orders:update",
      "clients:list",
      "clients:detail",
      "clients:create",
      "clients:update",
      "deliveries:list",
      "deliveries:detail",
      "deliveries:create",
      "deliveries:update",
      "incomes:list",
      "incomes:create",
      "expenses:list",
      "expenses:create",
      "finances:view",
    ];
    for (const code of userPermissions) {
      if (permissionIds[code]) {
        sqlite
          .prepare("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)")
          .run(roleIds.USER, permissionIds[code]);
      }
    }
    console.log(`✓ Assigned ${userPermissions.length} permissions to USER role`);

    // 5. Create admin user
    const passwordHash = await bcrypt.hash("admin123", 10);
    const now = new Date().toISOString();
    sqlite
      .prepare(
        "INSERT INTO users (last_name, first_name, email, password_hash, role_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .run("Админ", "Админ", "admin@polanet.local", passwordHash, roleIds.ADMIN, now, now);
    console.log("\n✓ Created admin user:");
    console.log(`  Email: admin@polanet.local`);
    console.log(`  Password: admin123`);

    console.log("\n=== Database initialization complete! ===");
  } catch (error) {
    console.error("❌ Ошибка при инициализации:", error);
  } finally {
    sqlite.close();
  }
}

try {
  sqlite.exec(createTables);
  console.log("✅ Таблицы успешно созданы!");
} catch (error) {
  console.error("❌ Ошибка при создании таблиц:", error);
}

// Run async initialization
initData();
