import { Router } from "express";
import { and, asc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { roles, teams, users, works } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { requireAnyPermission, requirePermission } from "../middleware/permissions.js";
import { teamSchema } from "../middleware/validators.js";

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

const workerRoleId = () =>
  db.select({ id: roles.id }).from(roles).where(eq(roles.code, "WORKER")).get()?.id ?? -1;

// Участники бригады (рабочие)
const getMembers = (teamId: number) =>
  db
    .select({
      id: users.id,
      lastName: users.lastName,
      firstName: users.firstName,
      middleName: users.middleName,
      phone: users.phone,
    })
    .from(users)
    .where(and(eq(users.teamId, teamId), eq(users.roleId, workerRoleId())))
    .orderBy(asc(users.lastName), asc(users.firstName))
    .all();

const getTeamDetail = (id: number) => {
  const team = db.select().from(teams).where(eq(teams.id, id)).get();
  return team ? { ...team, members: getMembers(id) } : null;
};

/**
 * Полностью заменяет состав бригады: перечисленные рабочие переходят в неё
 * (уходя из прежних бригад), остальные текущие участники остаются без бригады.
 */
const setMembers = (teamId: number, memberIds: number[]) => {
  const roleId = workerRoleId();
  const now = new Date().toISOString();
  const detach = db
    .update(users)
    .set({ teamId: null, updatedAt: now })
    .where(
      memberIds.length
        ? and(eq(users.teamId, teamId), notInArray(users.id, memberIds))
        : eq(users.teamId, teamId),
    );
  detach.run();
  if (memberIds.length) {
    db.update(users)
      .set({ teamId, updatedAt: now })
      .where(and(inArray(users.id, memberIds), eq(users.roleId, roleId)))
      .run();
  }
};

// Неизвестные id или не-рабочие в составе — ошибка
const validateMembers = (memberIds?: number[]) => {
  if (!memberIds?.length) return null;
  const found = db
    .select({ id: users.id })
    .from(users)
    .where(and(inArray(users.id, memberIds), eq(users.roleId, workerRoleId())))
    .all();
  return found.length === new Set(memberIds).size ? null : "В составе есть неизвестные рабочие";
};

// Список бригад (используется и календарём работ). По умолчанию только активные, ?all=1 — все
router.get(
  "/",
  authenticate,
  requireAnyPermission(["works:list", "teams:list"]),
  (req: AuthRequest, res) => {
    try {
      const all = req.query.all === "1" || req.query.all === "true";
      const memberCount = sql<number>`(
        SELECT count(*) FROM users u WHERE u.team_id = ${teams.id} AND u.role_id = ${workerRoleId()}
      )`;
      const rows = db
        .select({
          id: teams.id,
          name: teams.name,
          isActive: teams.isActive,
          sortOrder: teams.sortOrder,
          legacyId: teams.legacyId,
          createdAt: teams.createdAt,
          updatedAt: teams.updatedAt,
          memberCount,
        })
        .from(teams)
        .where(all ? undefined : eq(teams.isActive, true))
        .orderBy(asc(teams.sortOrder), asc(teams.id))
        .all();
      res.json(rows);
    } catch (error) {
      handleError(res, error, "getting teams");
    }
  },
);

router.get("/:id", authenticate, requirePermission("teams:detail"), (req: AuthRequest, res) => {
  try {
    const team = getTeamDetail(Number(req.params.id));
    if (!team) return res.status(404).json({ error: "Бригада не найдена" });
    res.json(team);
  } catch (error) {
    handleError(res, error, "getting team");
  }
});

router.post("/", authenticate, requirePermission("teams:manage"), (req: AuthRequest, res) => {
  try {
    const { memberIds, ...data } = teamSchema.parse(req.body);
    const membersError = validateMembers(memberIds);
    if (membersError) return res.status(400).json({ error: membersError });

    const now = new Date().toISOString();
    const id = db.transaction(() => {
      const sortOrder =
        data.sortOrder ??
        (db.select({ max: sql<number>`coalesce(max(${teams.sortOrder}), -1)` }).from(teams).get()
          ?.max ?? -1) + 1;
      const result = db
        .insert(teams)
        .values({ ...data, sortOrder, createdAt: now, updatedAt: now })
        .run();
      const teamId = Number(result.lastInsertRowid);
      if (memberIds) setMembers(teamId, memberIds);
      return teamId;
    });
    res.status(201).json(getTeamDetail(id));
  } catch (error) {
    handleError(res, error, "creating team");
  }
});

router.put("/:id", authenticate, requirePermission("teams:manage"), (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    if (!db.select({ id: teams.id }).from(teams).where(eq(teams.id, id)).get()) {
      return res.status(404).json({ error: "Бригада не найдена" });
    }
    const { memberIds, ...data } = teamSchema.partial().parse(req.body);
    const membersError = validateMembers(memberIds);
    if (membersError) return res.status(400).json({ error: membersError });

    db.transaction(() => {
      db.update(teams)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(teams.id, id))
        .run();
      if (memberIds) setMembers(id, memberIds);
    });
    res.json(getTeamDetail(id));
  } catch (error) {
    handleError(res, error, "updating team");
  }
});

// Удаление: работы бригады переезжают в «Без бригады», рабочие остаются без бригады
router.delete("/:id", authenticate, requirePermission("teams:manage"), (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = db.transaction(() => {
      db.update(works).set({ teamId: null }).where(eq(works.teamId, id)).run();
      db.update(users).set({ teamId: null }).where(eq(users.teamId, id)).run();
      return db.delete(teams).where(eq(teams.id, id)).run().changes;
    });
    if (deleted === 0) return res.status(404).json({ error: "Бригада не найдена" });
    res.status(204).send();
  } catch (error) {
    handleError(res, error, "deleting team");
  }
});

export default router;
