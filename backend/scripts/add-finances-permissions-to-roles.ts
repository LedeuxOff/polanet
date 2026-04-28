import { db } from "../src/db/index.js";
import { permissions, rolePermissions, roles } from "../src/db/schema.js";
import { eq, and } from "drizzle-orm";

async function addFinancesPermissionsToRoles() {
  const permissionsToAdd = [
    { code: "expenses:list", name: "Просмотр списка расходов" },
    { code: "incomes:list", name: "Просмотр списка доходов" },
  ];

  for (const perm of permissionsToAdd) {
    console.log(`\nProcessing permission: ${perm.code}...`);

    // Проверяем, существует ли уже permission
    const existingPermission = await db
      .select()
      .from(permissions)
      .where(eq(permissions.code, perm.code))
      .limit(1);

    let permissionId: number;

    if (existingPermission.length > 0) {
      console.log(`Permission '${perm.code}' already exists with ID:`, existingPermission[0].id);
      permissionId = existingPermission[0].id;
    } else {
      // Создаем permission
      const result = await db
        .insert(permissions)
        .values({
          code: perm.code,
          name: perm.name,
          module: "finances",
          description: `Доступ к ${perm.name.toLowerCase()}`,
        })
        .returning();

      permissionId = result[0].id;
      console.log(`Created permission '${perm.code}' with ID:`, permissionId);
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
        console.log(`Added '${perm.code}' to role: ${role.name} (${role.code})`);
      } else {
        console.log(`Role '${role.name}' already has '${perm.code}' permission`);
      }
    }
  }

  console.log("\nDone!");
}

addFinancesPermissionsToRoles().catch(console.error);
