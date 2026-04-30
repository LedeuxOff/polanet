import Database from "better-sqlite3";
import { db } from "../src/db/index.js";
import { permissions, rolePermissions, roles } from "../src/db/schema.js";
import { and, eq } from "drizzle-orm";

console.log("Назначение прав доступа ролям...\n");

// Получаем все права
const allPermissions = db.select().from(permissions).all();
console.log(`Найдено прав: ${allPermissions.length}`);

// Получаем роли ADMIN и DEVELOPER
const adminRole = db.select().from(roles).where(eq(roles.code, "ADMIN")).get();
const developerRole = db.select().from(roles).where(eq(roles.code, "DEVELOPER")).get();

let assignedCount = 0;
let skippedCount = 0;

// Назначаем все права ADMIN
if (adminRole) {
  console.log(`\nНазначение прав для роли ADMIN (${adminRole.name})...`);
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
  console.log(`✅ Роль ADMIN получила все права`);
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
  console.log(`✅ Роль DEVELOPER получила все права`);
} else {
  console.log("⚠️ Роль DEVELOPER не найдена!");
}

console.log(`\n=== ИТОГО ===`);
console.log(`Назначено новых прав: ${assignedCount}`);
console.log(`Пропущено (уже есть): ${skippedCount}`);
console.log(`Всего прав в системе: ${allPermissions.length}`);

// Проверяем результат
console.log("\n=== ПРОВЕРКА ===");
if (adminRole) {
  const sqlite = new Database("data/polanet.db");
  const adminCnt = sqlite
    .prepare("SELECT COUNT(*) as cnt FROM role_permissions WHERE role_id = ?")
    .get(adminRole.id) as { cnt: number };
  console.log(`ADMIN прав: ${adminCnt.cnt}`);
  sqlite.close();
}
if (developerRole) {
  const sqlite = new Database("data/polanet.db");
  const devCnt = sqlite
    .prepare("SELECT COUNT(*) as cnt FROM role_permissions WHERE role_id = ?")
    .get(developerRole.id) as { cnt: number };
  console.log(`DEVELOPER прав: ${devCnt.cnt}`);
  sqlite.close();
}

console.log("\nГотово!");
