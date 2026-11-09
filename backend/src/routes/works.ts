import { Router } from "express";
import { and, asc, desc, eq, gte, isNull, lte, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { db } from "../db/index.js";
import { clients, roles, teams, users, workStatuses, workTypes, works } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import {
  createWorkSchema,
  isValidWorkTimeRange,
  updateWorkSchema,
} from "../middleware/validators.js";

const router = Router();

// Нормализует телефон к формату 7XXXXXXXXXX (как хранятся телефоны клиентов)
export function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && (digits[0] === "7" || digits[0] === "8")) return "7" + digits.slice(1);
  if (digits.length === 10) return "7" + digits;
  return digits || null;
}

const measurers = alias(users, "measurers");

// Работа вместе с клиентом, бригадой, статусом, типом и замерщиком
const selectWork = () =>
  db
    .select({
      work: works,
      client: clients,
      team: teams,
      status: workStatuses,
      type: workTypes,
      measurer: {
        id: measurers.id,
        lastName: measurers.lastName,
        firstName: measurers.firstName,
        middleName: measurers.middleName,
      },
    })
    .from(works)
    .leftJoin(clients, eq(works.clientId, clients.id))
    .leftJoin(teams, eq(works.teamId, teams.id))
    .leftJoin(workStatuses, eq(works.status, workStatuses.code))
    .leftJoin(workTypes, eq(works.workType, workTypes.code))
    .leftJoin(measurers, eq(works.measurerId, measurers.id));

type WorkRow = {
  work: typeof works.$inferSelect;
  client: typeof clients.$inferSelect | null;
  team: typeof teams.$inferSelect | null;
  status: typeof workStatuses.$inferSelect | null;
  type: typeof workTypes.$inferSelect | null;
  measurer: { id: number; lastName: string; firstName: string; middleName: string | null } | null;
};

const toDto = ({ work, client, team, status, type, measurer }: WorkRow) => ({
  ...work,
  // Статус и тип из справочников; если кода нет в справочнике — показываем сам код
  statusInfo: status
    ? { code: status.code, name: status.name, color: status.color }
    : { code: work.status, name: work.status, color: "slate" },
  workTypeInfo: type ? { code: type.code, name: type.name } : { code: work.workType, name: work.workType },
  measurer: measurer?.id ? measurer : null,
  client: client
    ? {
        id: client.id,
        type: client.type,
        lastName: client.lastName,
        firstName: client.firstName,
        middleName: client.middleName,
        organizationName: client.organizationName,
        phone: client.phone,
        email: client.email,
      }
    : null,
  team: team ? { id: team.id, name: team.name } : null,
});

const getWorkDto = (id: number) => {
  const row = selectWork().where(eq(works.id, id)).get();
  return row ? toDto(row) : null;
};

const handleError = (res: any, error: unknown, context: string) => {
  console.error(`Error ${context}:`, error);
  if (error instanceof Error && error.name === "ZodError") {
    return res.status(400).json({ error: "Ошибка валидации", details: error });
  }
  res
    .status(500)
    .json({ error: "Ошибка сервера", details: error instanceof Error ? error.message : error });
};

// Создаёт клиента из формы работы и возвращает его id
const createClientFromWork = (newClient: {
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
}) => {
  const now = new Date().toISOString();
  const result = db
    .insert(clients)
    .values({
      type: "individual",
      firstName: newClient.firstName,
      lastName: newClient.lastName || null,
      phone: normalizePhone(newClient.phone),
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return Number(result.lastInsertRowid);
};

// Проверка ссылок работы: бригада, клиент, статус и тип из справочников, замерщик-рабочий
const ensureRefsExist = (data: {
  teamId?: number | null;
  clientId?: number | null;
  status?: string;
  workType?: string;
  measurerId?: number | null;
}): string | null => {
  const { teamId, clientId, status, workType, measurerId } = data;
  if (teamId && !db.select({ id: teams.id }).from(teams).where(eq(teams.id, teamId)).get()) {
    return "Бригада не найдена";
  }
  if (clientId && !db.select({ id: clients.id }).from(clients).where(eq(clients.id, clientId)).get()) {
    return "Клиент не найден";
  }
  if (
    status &&
    !db.select({ id: workStatuses.id }).from(workStatuses).where(eq(workStatuses.code, status)).get()
  ) {
    return "Неизвестный статус";
  }
  if (
    workType &&
    !db.select({ id: workTypes.id }).from(workTypes).where(eq(workTypes.code, workType)).get()
  ) {
    return "Неизвестный тип работ";
  }
  if (measurerId) {
    const measurer = db
      .select({ id: users.id })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(and(eq(users.id, measurerId), eq(roles.code, "WORKER")))
      .get();
    if (!measurer) return "Замерщик должен быть рабочим (роль WORKER)";
  }
  return null;
};

// Календарь: работы за период (включительно)
router.get(
  "/calendar",
  authenticate,
  requirePermission("works:list"),
  (req: AuthRequest, res) => {
    try {
      const startDate = String(req.query.startDate || "");
      const endDate = String(req.query.endDate || "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        return res.status(400).json({ error: "Нужны startDate и endDate в формате YYYY-MM-DD" });
      }

      const rows = selectWork()
        .where(
          and(
            gte(works.date, startDate),
            lte(works.date, endDate),
            // Статусы «Удалено», «Архив» и др. с show_in_calendar = 0 в календаре не показываем
            or(isNull(workStatuses.id), eq(workStatuses.showInCalendar, true)),
          ),
        )
        .orderBy(asc(works.date), asc(works.startTime), asc(works.id))
        .all();

      res.json(rows.map(toDto));
    } catch (error) {
      handleError(res, error, "getting works calendar");
    }
  },
);

// Список работ (используется на карточке клиента): ?clientId=&page=&limit=
router.get("/", authenticate, requirePermission("works:list"), (req: AuthRequest, res) => {
  try {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 10, 1), 100);
    const clientId = req.query.clientId ? Number(req.query.clientId) : undefined;

    const where = clientId ? eq(works.clientId, clientId) : undefined;

    const total =
      db
        .select({ count: sql<number>`count(*)` })
        .from(works)
        .where(where)
        .get()?.count ?? 0;

    const rows = selectWork()
      .where(where)
      .orderBy(desc(works.date), desc(works.startTime), desc(works.id))
      .limit(limit)
      .offset((page - 1) * limit)
      .all();

    res.json({
      data: rows.map(toDto),
      pagination: { page, limit, totalRecords: total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    handleError(res, error, "getting works");
  }
});

// Детали работы
router.get("/:id", authenticate, requirePermission("works:detail"), (req: AuthRequest, res) => {
  try {
    const work = getWorkDto(Number(req.params.id));
    if (!work) return res.status(404).json({ error: "Работа не найдена" });
    res.json(work);
  } catch (error) {
    handleError(res, error, "getting work");
  }
});

// Создать работу
router.post("/", authenticate, requirePermission("works:create"), (req: AuthRequest, res) => {
  try {
    const { newClient, ...data } = createWorkSchema.parse(req.body);

    const refError = ensureRefsExist(data);
    if (refError) return res.status(400).json({ error: refError });

    const now = new Date().toISOString();
    const id = db.transaction(() => {
      const clientId = newClient ? createClientFromWork(newClient) : (data.clientId ?? null);
      const result = db
        .insert(works)
        .values({
          ...data,
          teamId: data.teamId ?? null,
          clientId,
          createdById: req.user?.id ?? null,
          createdAt: now,
          updatedAt: now,
        })
        .run();
      return Number(result.lastInsertRowid);
    });

    res.status(201).json(getWorkDto(id));
  } catch (error) {
    handleError(res, error, "creating work");
  }
});

// Обновить работу (в т.ч. перенос в другой слот: date/teamId)
router.put("/:id", authenticate, requirePermission("works:update"), (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const existing = db
      .select({ id: works.id, startTime: works.startTime, endTime: works.endTime })
      .from(works)
      .where(eq(works.id, id))
      .get();
    if (!existing) return res.status(404).json({ error: "Работа не найдена" });

    const { newClient, ...data } = updateWorkSchema.parse(req.body);

    // Проверяем интервал с учётом полей, которые не пришли в запросе
    const start = data.startTime !== undefined ? data.startTime : existing.startTime;
    const end = data.endTime !== undefined ? data.endTime : existing.endTime;
    if (!isValidWorkTimeRange(start, end)) {
      return res.status(400).json({ error: "Время окончания должно быть позже начала" });
    }

    const refError = ensureRefsExist(data);
    if (refError) return res.status(400).json({ error: refError });

    db.transaction(() => {
      const patch: Partial<typeof works.$inferInsert> = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      if (newClient) patch.clientId = createClientFromWork(newClient);
      db.update(works).set(patch).where(eq(works.id, id)).run();
    });

    res.json(getWorkDto(id));
  } catch (error) {
    handleError(res, error, "updating work");
  }
});

// Удалить работу
router.delete("/:id", authenticate, requirePermission("works:delete"), (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const result = db.delete(works).where(eq(works.id, id)).run();
    if (result.changes === 0) return res.status(404).json({ error: "Работа не найдена" });
    res.status(204).send();
  } catch (error) {
    handleError(res, error, "deleting work");
  }
});

export default router;
