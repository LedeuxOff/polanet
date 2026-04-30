import { db } from "./index.js";
import { roles, users, permissions, rolePermissions } from "./schema.js";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";

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
console.log("Назначение прав доступа...");

// Получаем все права
const allPermissions = db.select().from(permissions).all();

// Назначаем все права ADMIN
if (adminRole) {
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
    }
  }
  console.log(`Роль "Администратор" получены все права`);
}

// Назначаем все права DEVELOPER
if (developerRole) {
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
    }
  }
  console.log(`Роль "Разработчик" получены все права`);
}

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

console.log("База данных успешно инициализирована!");
