import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { requirePermission } from "../middleware/permissions";
import { db } from "../db";
import { permissions, rolePermissions } from "../db/schema";
import { eq, and, asc } from "drizzle-orm";

const router = Router();

interface AuthRequest extends Request {
  user?: { id: number; email: string; roleId: number };
}

// Получить все доступные права
// Note: No permission check required - this endpoint is needed to manage permissions
router.get("/", authenticate, (_req: AuthRequest, res: Response) => {
  db.select()
    .from(permissions)
    .orderBy(asc(permissions.module), asc(permissions.code))
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error: "Ошибка при получении прав", details: error.message });
    });
});

// Получить права роли
// Note: No permission check required - this endpoint is needed to manage permissions
router.get("/role/:roleId", authenticate, (req: AuthRequest, res: Response) => {
  const roleId = parseInt(req.params.roleId);

  if (isNaN(roleId)) {
    res.status(400).json({ error: "Неверный ID роли" });
    return;
  }

  db.select({
    permissionCode: permissions.code,
  })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, roleId))
    .then((result) => {
      const permissionCodes = result.map((rp) => rp.permissionCode);
      res.json({ roleId, permissions: permissionCodes });
    })
    .catch((error) => {
      res.status(500).json({ error: "Ошибка при получении прав роли", details: error.message });
    });
});

// Назначить права роли
router.post(
  "/role/:roleId",
  authenticate,
  requirePermission("permissions:manage"),
  async (req: AuthRequest, res: Response) => {
    const roleId = parseInt(req.params.roleId);

    if (isNaN(roleId)) {
      res.status(400).json({ error: "Неверный ID роли" });
      return;
    }

    const { permissionCodes } = req.body;

    if (!Array.isArray(permissionCodes)) {
      res.status(400).json({ error: "permissionCodes должен быть массивом" });
      return;
    }

    try {
      // Удаляем все существующие права роли
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

      // Добавляем новые права
      if (permissionCodes.length > 0) {
        const inserts = permissionCodes.map((code: string) =>
          db
            .select({ id: permissions.id })
            .from(permissions)
            .where(eq(permissions.code, code))
            .then((result) => {
              if (result.length > 0) {
                return db.insert(rolePermissions).values({
                  roleId,
                  permissionId: result[0].id,
                });
              }
            }),
        );

        await Promise.all(inserts.filter(Boolean));
      }

      res.status(200).json({ message: "Права успешно назначены" });
    } catch (error: any) {
      res.status(500).json({ error: "Ошибка при назначении прав", details: error.message });
    }
  },
);

// Проверить, есть ли у роли определенный право
// Note: No permission check required - this is used by the frontend permission system
router.post("/check", authenticate, (req: AuthRequest, res: Response) => {
  const { roleId, permissionCode } = req.body;

  if (!roleId || !permissionCode) {
    res.status(400).json({ error: "roleId и permissionCode обязательны" });
    return;
  }

  db.select({ count: permissions.id })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(and(eq(rolePermissions.roleId, roleId), eq(permissions.code, permissionCode)))
    .then((result) => {
      res.json({ hasPermission: result.length > 0 });
    })
    .catch((error) => {
      res.status(500).json({ error: "Ошибка при проверке права", details: error.message });
    });
});

export default router;
