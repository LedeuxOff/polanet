import { db } from "../src/db/index.js";
import { permissions, rolePermissions, roles } from "../src/db/schema.js";
import { eq, and } from "drizzle-orm";

async function addFinancesViewPermission() {
  console.log("Adding 'finances:view' permission...");

  // Проверяем, существует ли уже permission
  const existingPermission = await db
    .select()
    .from(permissions)
    .where(eq(permissions.code, "finances:view"))
    .limit(1);

  let permissionId: number;

  if (existingPermission.length > 0) {
    console.log("Permission 'finances:view' already exists with ID:", existingPermission[0].id);
    permissionId = existingPermission[0].id;
  } else {
    // Создаем permission
    const result = await db
      .insert(permissions)
      .values({
        code: "finances:view",
        name: "Просмотр финансовой статистики",
        module: "finances",
        description: "Доступ к просмотру статистики по доходам и расходам",
      })
      .returning();

    permissionId = result[0].id;
    console.log("Created permission 'finances:view' with ID:", permissionId);
  }

  // Добавляем permission ко всем ролям
  const allRoles = await db.select().from(roles);

  for (const role of allRoles) {
    // Проверяем, есть ли уже связь
    const existing = await db
      .select()
      .from(rolePermissions)
      .where(
        and(eq(rolePermissions.roleId, role.id), eq(rolePermissions.permissionId, permissionId)),
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(rolePermissions).values({
        roleId: role.id,
        permissionId: permissionId,
      });
      console.log(`Added 'finances:view' to role: ${role.name} (${role.code})`);
    } else {
      console.log(`Role '${role.name}' already has 'finances:view' permission`);
    }
  }

  console.log("Done!");
}

addFinancesViewPermission().catch(console.error);
