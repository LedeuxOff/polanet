import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../../data/polanet.db");

const db = new Database(dbPath);

console.log("Добавление разрешений templates в существующую базу данных...\n");

// 1. Добавляем разрешения если их нет
const templatesPermissions = [
  { module: "templates", code: "templates:list", name: "Просмотр списка шаблонов" },
  { module: "templates", code: "templates:create", name: "Создание шаблона" },
  { module: "templates", code: "templates:delete", name: "Удаление шаблона" },
];

const permissionIds: Record<string, number> = {};

for (const perm of templatesPermissions) {
  const existing = db
    .prepare("SELECT id FROM permissions WHERE module = ? AND code = ?")
    .get(perm.module, perm.code) as { id: number } | undefined;

  if (existing) {
    console.log(`✓ Разрешение уже существует: ${perm.code} (ID: ${existing.id})`);
    permissionIds[perm.code] = existing.id;
  } else {
    const result = db
      .prepare("INSERT INTO permissions (module, code, name) VALUES (?, ?, ?)")
      .run(perm.module, perm.code, perm.name);
    permissionIds[perm.code] = result.lastInsertRowid as number;
    console.log(`✓ Создано разрешение: ${perm.code} (ID: ${permissionIds[perm.code]})`);
  }
}

// 2. Получаем ID ролей ADMIN и DEVELOPER
const adminRole = db.prepare("SELECT id FROM roles WHERE code = 'ADMIN'").get() as
  | { id: number }
  | undefined;
const developerRole = db.prepare("SELECT id FROM roles WHERE code = 'DEVELOPER'").get() as
  | { id: number }
  | undefined;

if (!adminRole) {
  console.error("❌ Роль ADMIN не найдена!");
  db.close();
  process.exit(1);
}

if (!developerRole) {
  console.warn("⚠️ Роль DEVELOPER не найдена");
}

// 3. Назначаем разрешения на роль ADMIN
console.log(`\nНазначение разрешений на роль ADMIN (ID: ${adminRole.id})...`);
for (const code of Object.keys(permissionIds)) {
  const existing = db
    .prepare("SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ?")
    .get(adminRole.id, permissionIds[code]);

  if (!existing) {
    db.prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)").run(
      adminRole.id,
      permissionIds[code],
    );
    console.log(`  ✓ Добавлено: ${code}`);
  } else {
    console.log(`  - Уже существует: ${code}`);
  }
}

// 4. Назначаем разрешения на роль DEVELOPER
if (developerRole) {
  console.log(`\nНазначение разрешений на роль DEVELOPER (ID: ${developerRole.id})...`);
  for (const code of Object.keys(permissionIds)) {
    const existing = db
      .prepare("SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ?")
      .get(developerRole.id, permissionIds[code]);

    if (!existing) {
      db.prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)").run(
        developerRole.id,
        permissionIds[code],
      );
      console.log(`  ✓ Добавлено: ${code}`);
    } else {
      console.log(`  - Уже существует: ${code}`);
    }
  }
}

db.close();
console.log("\n=== Все разрешения templates успешно добавлены! ===");
