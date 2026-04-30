import { db } from "./index.js";
import { roles, users } from "./schema.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

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

// Создаем пользователей по умолчанию
const adminRole = db.select().from(roles).where(eq(roles.code, "ADMIN")).get();
const developerRole = db.select().from(roles).where(eq(roles.code, "DEVELOPER")).get();

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
