import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

/**
 * Сброс пароля администратора
 *
 * Использование:
 * npx tsx src/scripts/reset-admin-password.ts [новый-пароль]
 *
 * Если новый-пароль не указан, будет использован пароль по умолчанию: admin123
 */

async function resetAdminPassword() {
  const newPassword = process.argv[2] || "admin123";
  const adminEmail = "admin@polanet.local";

  console.log("Сброс пароля администратора...");
  console.log(`Email: ${adminEmail}`);
  console.log(`Новый пароль: ${newPassword}`);

  try {
    // Находим администратора
    const admin = db.select().from(users).where(eq(users.email, adminEmail)).get();

    if (!admin) {
      console.error(`Пользователь с email ${adminEmail} не найден!`);
      process.exit(1);
    }

    // Хешируем новый пароль
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль
    db.update(users)
      .set({
        passwordHash,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.email, adminEmail))
      .run();

    console.log("✅ Пароль администратора успешно сброшен!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Пароль: ${newPassword}`);
  } catch (error) {
    console.error("❌ Ошибка при сбросе пароля:", error);
    process.exit(1);
  }
}

resetAdminPassword();
