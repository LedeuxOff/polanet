import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { permissions, rolePermissions } from "../db/schema";
import { eq, and, or } from "drizzle-orm";

export interface AuthRequest extends Request {
  user?: { id: number; email: string; roleId: number };
}

// Middleware для проверки наличия права у пользователя
export function requirePermission(permissionCode: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.roleId) {
      res.status(403).json({ error: "Доступ запрещен" });
      return;
    }

    try {
      const result = await db
        .select({ count: permissions.id })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(
          and(eq(rolePermissions.roleId, req.user.roleId), eq(permissions.code, permissionCode)),
        );

      if (result.length > 0) {
        next();
      } else {
        res.status(403).json({ error: "Доступ запрещен: недостаточно прав" });
      }
    } catch (error: any) {
      res.status(500).json({ error: "Ошибка при проверке прав", details: error.message });
    }
  };
}

// Middleware для проверки наличия хотя бы одного из прав
export function requireAnyPermission(permissionCodes: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.roleId) {
      res.status(403).json({ error: "Доступ запрещен" });
      return;
    }

    const roleId = req.user.roleId;

    try {
      // Создаем OR условие для каждого права
      const conditions = permissionCodes.map((code) => eq(permissions.code, code));

      const result = await db
        .select({ count: permissions.id })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(and(eq(rolePermissions.roleId, roleId), or(...conditions)));

      if (result.length > 0) {
        next();
      } else {
        res.status(403).json({ error: "Доступ запрещен: недостаточно прав" });
      }
    } catch (error: any) {
      res.status(500).json({ error: "Ошибка при проверке прав", details: error.message });
    }
  };
}

// Middleware для проверки всех прав
export function requireAllPermissions(permissionCodes: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.roleId) {
      res.status(403).json({ error: "Доступ запрещен" });
      return;
    }

    const roleId = req.user.roleId;

    try {
      const results = await Promise.all(
        permissionCodes.map((code) =>
          db
            .select({ count: permissions.id })
            .from(rolePermissions)
            .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
            .where(and(eq(rolePermissions.roleId, roleId), eq(permissions.code, code))),
        ),
      );

      const allHavePermission = results.every((result) => result.length > 0);

      if (allHavePermission) {
        next();
      } else {
        res.status(403).json({ error: "Доступ запрещен: недостаточно прав" });
      }
    } catch (error: any) {
      res.status(500).json({ error: "Ошибка при проверке прав", details: error.message });
    }
  };
}
