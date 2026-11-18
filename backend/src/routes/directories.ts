import { Router } from "express";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { workStatuses, workTypes, works } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { requireAnyPermission, requirePermission } from "../middleware/permissions.js";
import { workStatusRefSchema, workTypeRefSchema } from "../middleware/validators.js";

/**
 * Справочники календаря работ: статусы (/work-statuses) и типы работ (/work-types).
 * Работа хранит код записи; код генерируется при создании и не меняется.
 */
const router = Router();

const handleError = (res: any, error: unknown, context: string) => {
  console.error(`Error ${context}:`, error);
  if (error instanceof Error && error.name === "ZodError") {
    return res.status(400).json({ error: "Ошибка валидации", details: error });
  }
  res
    .status(500)
    .json({ error: "Ошибка сервера", details: error instanceof Error ? error.message : error });
};

const newCode = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const canRead = requireAnyPermission(["works:list", "directories:manage"]);
const canManage = requirePermission("directories:manage");

// ---------- Статусы ----------

router.get("/work-statuses", authenticate, canRead, (_req: AuthRequest, res) => {
  try {
    res.json(
      db.select().from(workStatuses).orderBy(asc(workStatuses.sortOrder), asc(workStatuses.id)).all(),
    );
  } catch (error) {
    handleError(res, error, "getting work statuses");
  }
});

router.post("/work-statuses", authenticate, canManage, (req: AuthRequest, res) => {
  try {
    const data = workStatusRefSchema.parse(req.body);
    const now = new Date().toISOString();
    const maxOrder =
      db.select({ max: sql<number>`coalesce(max(${workStatuses.sortOrder}), -1)` }).from(workStatuses).get()
        ?.max ?? -1;
    const result = db
      .insert(workStatuses)
      .values({
        code: newCode("status"),
        name: data.name,
        color: data.color ?? "blue",
        sortOrder: data.sortOrder ?? maxOrder + 1,
        showInCalendar: data.showInCalendar ?? true,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    res
      .status(201)
      .json(
        db.select().from(workStatuses).where(eq(workStatuses.id, Number(result.lastInsertRowid))).get(),
      );
  } catch (error) {
    handleError(res, error, "creating work status");
  }
});

router.put("/work-statuses/:id", authenticate, canManage, (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const data = workStatusRefSchema.partial().parse(req.body);
    const result = db
      .update(workStatuses)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(workStatuses.id, id))
      .run();
    if (result.changes === 0) return res.status(404).json({ error: "Статус не найден" });
    res.json(db.select().from(workStatuses).where(eq(workStatuses.id, id)).get());
  } catch (error) {
    handleError(res, error, "updating work status");
  }
});

router.delete("/work-statuses/:id", authenticate, canManage, (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const status = db.select().from(workStatuses).where(eq(workStatuses.id, id)).get();
    if (!status) return res.status(404).json({ error: "Статус не найден" });
    const used =
      db
        .select({ count: sql<number>`count(*)` })
        .from(works)
        .where(eq(works.status, status.code))
        .get()?.count ?? 0;
    if (used > 0) {
      return res
        .status(409)
        .json({ error: `Статус используется в ${used} работах — сначала смените им статус` });
    }
    db.delete(workStatuses).where(eq(workStatuses.id, id)).run();
    res.status(204).send();
  } catch (error) {
    handleError(res, error, "deleting work status");
  }
});

// ---------- Типы работ ----------

router.get("/work-types", authenticate, canRead, (_req: AuthRequest, res) => {
  try {
    res.json(db.select().from(workTypes).orderBy(asc(workTypes.sortOrder), asc(workTypes.id)).all());
  } catch (error) {
    handleError(res, error, "getting work types");
  }
});

router.post("/work-types", authenticate, canManage, (req: AuthRequest, res) => {
  try {
    const data = workTypeRefSchema.parse(req.body);
    const now = new Date().toISOString();
    const maxOrder =
      db.select({ max: sql<number>`coalesce(max(${workTypes.sortOrder}), -1)` }).from(workTypes).get()
        ?.max ?? -1;
    const result = db
      .insert(workTypes)
      .values({
        code: newCode("type"),
        name: data.name,
        sortOrder: data.sortOrder ?? maxOrder + 1,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    res
      .status(201)
      .json(db.select().from(workTypes).where(eq(workTypes.id, Number(result.lastInsertRowid))).get());
  } catch (error) {
    handleError(res, error, "creating work type");
  }
});

router.put("/work-types/:id", authenticate, canManage, (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const data = workTypeRefSchema.partial().parse(req.body);
    const result = db
      .update(workTypes)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(workTypes.id, id))
      .run();
    if (result.changes === 0) return res.status(404).json({ error: "Тип работ не найден" });
    res.json(db.select().from(workTypes).where(eq(workTypes.id, id)).get());
  } catch (error) {
    handleError(res, error, "updating work type");
  }
});

router.delete("/work-types/:id", authenticate, canManage, (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const type = db.select().from(workTypes).where(eq(workTypes.id, id)).get();
    if (!type) return res.status(404).json({ error: "Тип работ не найден" });
    const used =
      db
        .select({ count: sql<number>`count(*)` })
        .from(works)
        .where(eq(works.workType, type.code))
        .get()?.count ?? 0;
    if (used > 0) {
      return res
        .status(409)
        .json({ error: `Тип используется в ${used} работах — сначала смените им тип` });
    }
    db.delete(workTypes).where(eq(workTypes.id, id)).run();
    res.status(204).send();
  } catch (error) {
    handleError(res, error, "deleting work type");
  }
});

export default router;
