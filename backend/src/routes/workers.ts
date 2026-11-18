import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { and, asc, eq, like, or, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { roles, teams, users } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import { workerSchema } from "../middleware/validators.js";
import { normalizePhone } from "./works.js";

/**
 * Рабочие — пользователи с ролью WORKER.
 * Вход в админку им закрыт (см. routes/auth.ts), поэтому email и пароль служебные.
 */
const router = Router();

const WORKER_ROLE = "WORKER";

const getWorkerRoleId = () => {
  const role = db.select({ id: roles.id }).from(roles).where(eq(roles.code, WORKER_ROLE)).get();
  if (!role) throw new Error("Роль WORKER не найдена — примените миграцию 0032");
  return role.id;
};

// Только безопасные поля + бригада
const selectWorker = () =>
  db
    .select({
      id: users.id,
      lastName: users.lastName,
      firstName: users.firstName,
      middleName: users.middleName,
      phone: users.phone,
      teamId: users.teamId,
      teamName: teams.name,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(teams, eq(users.teamId, teams.id));

const getWorker = (id: number) =>
  selectWorker()
    .where(and(eq(users.id, id), eq(users.roleId, getWorkerRoleId())))
    .get() ?? null;

const handleError = (res: any, error: unknown, context: string) => {
  console.error(`Error ${context}:`, error);
  if (error instanceof Error && error.name === "ZodError") {
    return res.status(400).json({ error: "Ошибка валидации", details: error });
  }
  res
    .status(500)
    .json({ error: "Ошибка сервера", details: error instanceof Error ? error.message : error });
};

const teamExists = (teamId?: number | null) =>
  !teamId || !!db.select({ id: teams.id }).from(teams).where(eq(teams.id, teamId)).get();

// Список рабочих: ?search=&teamId=&page=&limit=
router.get("/", authenticate, requirePermission("workers:list"), (req: AuthRequest, res) => {
  try {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 10, 1), 500);
    const search = (req.query.search as string | undefined)?.trim();
    const teamId = req.query.teamId ? Number(req.query.teamId) : undefined;

    const conditions = [eq(users.roleId, getWorkerRoleId())];
    if (teamId) conditions.push(eq(users.teamId, teamId));
    if (search) {
      const term = `%${search}%`;
      const digits = search.replace(/\D/g, "");
      conditions.push(
        or(
          like(users.lastName, term),
          like(users.firstName, term),
          like(users.middleName, term),
          ...(digits.length >= 3 ? [like(users.phone, `%${digits}%`)] : []),
        )!,
      );
    }
    const where = and(...conditions);

    const total =
      db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(where)
        .get()?.count ?? 0;

    const data = selectWorker()
      .where(where)
      .orderBy(asc(users.lastName), asc(users.firstName))
      .limit(limit)
      .offset((page - 1) * limit)
      .all();

    res.json({
      data,
      pagination: { page, limit, totalRecords: total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    handleError(res, error, "getting workers");
  }
});

router.get("/:id", authenticate, requirePermission("workers:detail"), (req: AuthRequest, res) => {
  try {
    const worker = getWorker(Number(req.params.id));
    if (!worker) return res.status(404).json({ error: "Рабочий не найден" });
    res.json(worker);
  } catch (error) {
    handleError(res, error, "getting worker");
  }
});

router.post(
  "/",
  authenticate,
  requirePermission("workers:create"),
  async (req: AuthRequest, res) => {
    try {
      const data = workerSchema.parse(req.body);
      if (!teamExists(data.teamId)) return res.status(400).json({ error: "Бригада не найдена" });

      // Служебные учётные данные: вход рабочим закрыт, но поля в users обязательные
      const email = `worker-${crypto.randomUUID()}@workers.polanet.local`;
      const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);
      const now = new Date().toISOString();

      const result = db
        .insert(users)
        .values({
          lastName: data.lastName,
          firstName: data.firstName,
          middleName: data.middleName || null,
          phone: normalizePhone(data.phone),
          teamId: data.teamId ?? null,
          email,
          passwordHash,
          roleId: getWorkerRoleId(),
          createdAt: now,
          updatedAt: now,
        })
        .run();

      res.status(201).json(getWorker(Number(result.lastInsertRowid)));
    } catch (error) {
      handleError(res, error, "creating worker");
    }
  },
);

router.put("/:id", authenticate, requirePermission("workers:update"), (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    if (!getWorker(id)) return res.status(404).json({ error: "Рабочий не найден" });

    const data = workerSchema.partial().parse(req.body);
    if (!teamExists(data.teamId)) return res.status(400).json({ error: "Бригада не найдена" });

    const patch: Partial<typeof users.$inferInsert> = { updatedAt: new Date().toISOString() };
    if (data.lastName !== undefined) patch.lastName = data.lastName;
    if (data.firstName !== undefined) patch.firstName = data.firstName;
    if (data.middleName !== undefined) patch.middleName = data.middleName || null;
    if (data.phone !== undefined) patch.phone = normalizePhone(data.phone);
    if (data.teamId !== undefined) patch.teamId = data.teamId;

    db.update(users).set(patch).where(eq(users.id, id)).run();
    res.json(getWorker(id));
  } catch (error) {
    handleError(res, error, "updating worker");
  }
});

router.delete("/:id", authenticate, requirePermission("workers:delete"), (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    if (!getWorker(id)) return res.status(404).json({ error: "Рабочий не найден" });
    db.delete(users).where(eq(users.id, id)).run();
    res.status(204).send();
  } catch (error) {
    handleError(res, error, "deleting worker");
  }
});

export default router;
