import { Router, type Response } from "express";
import { desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { screedClients, works } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import { screedClientSchema } from "../middleware/validators.js";
import { normalizePhone } from "./works.js";

/** Клиенты стяжки (раздел «Стяжка») */
const router = Router();

const handleError = (res: Response, error: unknown, context: string) => {
  console.error(`Error ${context}:`, error);
  if (error instanceof Error && error.name === "ZodError") {
    return res.status(400).json({ error: "Ошибка валидации", details: error });
  }
  res
    .status(500)
    .json({
      error: "Ошибка сервера",
      details: error instanceof Error ? error.message : error,
    });
};

const worksCount = sql<number>`(SELECT count(*) FROM ${works} WHERE ${works.screedClientId} = ${screedClients.id})`;

const selectClient = () =>
  db
    .select({
      id: screedClients.id,
      lastName: screedClients.lastName,
      firstName: screedClients.firstName,
      middleName: screedClients.middleName,
      phone: screedClients.phone,
      notes: screedClients.notes,
      createdAt: screedClients.createdAt,
      updatedAt: screedClients.updatedAt,
      worksCount,
    })
    .from(screedClients);

const getClient = (id: number) =>
  selectClient().where(eq(screedClients.id, id)).get() ?? null;

const toValues = (data: ReturnType<typeof screedClientSchema.parse>) => ({
  lastName: data.lastName?.trim() || null,
  firstName: data.firstName.trim(),
  middleName: data.middleName?.trim() || null,
  phone: normalizePhone(data.phone),
  notes: data.notes?.trim() || null,
});

// Список: ?search=&page=&limit=
router.get(
  "/",
  authenticate,
  requirePermission("screed-clients:list"),
  (req: AuthRequest, res) => {
    try {
      const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
      const limit = Math.min(
        Math.max(parseInt(req.query.limit as string, 10) || 10, 1),
        100,
      );
      const search = (req.query.search as string | undefined)?.trim();

      let where;
      if (search) {
        const term = `%${search}%`;
        const digits = search.replace(/\D/g, "");
        where = or(
          like(screedClients.lastName, term),
          like(screedClients.firstName, term),
          like(screedClients.middleName, term),
          ...(digits.length >= 3
            ? [like(screedClients.phone, `%${digits}%`)]
            : []),
        );
      }

      const total =
        db
          .select({ count: sql<number>`count(*)` })
          .from(screedClients)
          .where(where)
          .get()?.count ?? 0;

      const data = selectClient()
        .where(where)
        .orderBy(desc(screedClients.createdAt), desc(screedClients.id))
        .limit(limit)
        .offset((page - 1) * limit)
        .all();

      res.json({
        data,
        pagination: {
          page,
          limit,
          totalRecords: total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      handleError(res, error, "getting screed clients");
    }
  },
);

router.get(
  "/:id",
  authenticate,
  requirePermission("screed-clients:detail"),
  (req: AuthRequest, res) => {
    try {
      const client = getClient(Number(req.params.id));
      if (!client) return res.status(404).json({ error: "Клиент не найден" });
      res.json(client);
    } catch (error) {
      handleError(res, error, "getting screed client");
    }
  },
);

router.post(
  "/",
  authenticate,
  requirePermission("screed-clients:create"),
  (req: AuthRequest, res) => {
    try {
      const data = screedClientSchema.parse(req.body);
      const now = new Date().toISOString();
      const result = db
        .insert(screedClients)
        .values({ ...toValues(data), createdAt: now, updatedAt: now })
        .run();
      res.status(201).json(getClient(Number(result.lastInsertRowid)));
    } catch (error) {
      handleError(res, error, "creating screed client");
    }
  },
);

router.put(
  "/:id",
  authenticate,
  requirePermission("screed-clients:update"),
  (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      if (!getClient(id))
        return res.status(404).json({ error: "Клиент не найден" });
      const data = screedClientSchema.parse(req.body);
      db.update(screedClients)
        .set({ ...toValues(data), updatedAt: new Date().toISOString() })
        .where(eq(screedClients.id, id))
        .run();
      res.json(getClient(id));
    } catch (error) {
      handleError(res, error, "updating screed client");
    }
  },
);

// Удаление: работы клиента остаются, но без клиента
router.delete(
  "/:id",
  authenticate,
  requirePermission("screed-clients:delete"),
  (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      if (!getClient(id))
        return res.status(404).json({ error: "Клиент не найден" });
      db.transaction(() => {
        db.update(works)
          .set({ screedClientId: null })
          .where(eq(works.screedClientId, id))
          .run();
        db.delete(screedClients).where(eq(screedClients.id, id)).run();
      });
      res.status(204).send();
    } catch (error) {
      handleError(res, error, "deleting screed client");
    }
  },
);

export default router;
