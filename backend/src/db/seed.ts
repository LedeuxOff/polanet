import { db } from "./index.js";
import { roles, users, permissions, rolePermissions } from "./schema.js";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаем папку data если не существует
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log("Создана папка: data");
}

// Создаем роли по умолчанию
const defaultRoles = [
  { code: "ADMIN", name: "Администратор" },
  { code: "DEVELOPER", name: "Разработчик" },
];

console.log("Создание ролей...");
for (const role of defaultRoles) {
  const existing = db.select().from(roles).where(eq(roles.code, role.code)).get();
  if (!existing) {
    db.insert(roles).values(role).run();
    console.log(`Роль "${role.name}" создана`);
  }
}

// Получаем созданные роли
const adminRole = db.select().from(roles).where(eq(roles.code, "ADMIN")).get();
const developerRole = db.select().from(roles).where(eq(roles.code, "DEVELOPER")).get();

// Назначаем все права доступа ролям ADMIN и DEVELOPER
console.log("\nНазначение прав доступа...");

// Получаем все права
const allPermissions = db.select().from(permissions).all();
console.log(`Найдено прав: ${allPermissions.length}`);

// Назначаем все права ADMIN
let assignedCount = 0;
let skippedCount = 0;

if (adminRole) {
  console.log(`Назначение прав для роли ADMIN (${adminRole.name})...`);
  for (const permission of allPermissions) {
    const existing = db
      .select()
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, adminRole.id),
          eq(rolePermissions.permissionId, permission.id),
        ),
      )
      .get();
    if (!existing) {
      db.insert(rolePermissions)
        .values({ roleId: adminRole.id, permissionId: permission.id })
        .run();
      assignedCount++;
    } else {
      skippedCount++;
    }
  }
  console.log(`✅ Роль "Администратор" получила все права`);
} else {
  console.log("⚠️ Роль ADMIN не найдена!");
}

// Назначаем все права DEVELOPER
if (developerRole) {
  console.log(`Назначение прав для роли DEVELOPER (${developerRole.name})...`);
  for (const permission of allPermissions) {
    const existing = db
      .select()
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, developerRole.id),
          eq(rolePermissions.permissionId, permission.id),
        ),
      )
      .get();
    if (!existing) {
      db.insert(rolePermissions)
        .values({ roleId: developerRole.id, permissionId: permission.id })
        .run();
      assignedCount++;
    } else {
      skippedCount++;
    }
  }
  console.log(`✅ Роль "Разработчик" получила все права`);
} else {
  console.log("⚠️ Роль DEVELOPER не найдена!");
}

console.log(`\nИтого: назначено ${assignedCount} новых прав, пропущено ${skippedCount}`);

// Создаем пользователей по умолчанию
const defaultUsers = [
  {
    email: "admin@test.com",
    password: "test",
    firstName: "Админ",
    lastName: "Тестовый",
    roleId: adminRole?.id,
  },
  {
    email: "developer@test.com",
    password: "test",
    firstName: "Разработчик",
    lastName: "Тестовый",
    roleId: developerRole?.id,
  },
];

for (const userData of defaultUsers) {
  if (userData.roleId) {
    const existingUser = db.select().from(users).where(eq(users.email, userData.email)).get();

    if (!existingUser) {
      const passwordHash = await bcrypt.hash(userData.password, 10);

      db.insert(users)
        .values({
          lastName: userData.lastName,
          firstName: userData.firstName,
          middleName: "",
          email: userData.email,
          phone: "",
          passwordHash,
          roleId: userData.roleId,
        })
        .run();

      console.log(`Пользователь ${userData.email} создан (пароль: ${userData.password})`);
    }
  }
}

console.log("\n✅ База данных успешно инициализирована!");
