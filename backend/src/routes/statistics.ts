import { Router } from "express";
import { sqlite } from "../db/index.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";

/**
 * Агрегированная статистика для страниц аналитики.
 * Даты в БД хранятся строками ISO / YYYY-MM-DD — год и месяц берём через substr.
 */
const router = Router();

const MONTHS = 12;

const parseYear = (value: unknown) => {
  const year = Number(value);
  return Number.isInteger(year) && year > 2000 && year < 2100 ? year : new Date().getFullYear();
};

/** Пустой массив на 12 месяцев */
const months = <T extends object>(make: () => T) =>
  Array.from({ length: MONTHS }, (_, i) => ({ month: i + 1, ...make() }));

/** Годы, по которым есть данные (по нескольким колонкам дат) */
const yearsFrom = (queries: string[]) => {
  const set = new Set<number>([new Date().getFullYear()]);
  for (const q of queries) {
    for (const row of sqlite.prepare(q).all() as { y: string | null }[]) {
      const y = Number(row.y);
      if (y > 2000 && y < 2100) set.add(y);
    }
  }
  return [...set].sort((a, b) => b - a);
};

type MonthRow = { m: string; key: string; total: number; cnt: number };

// ---------- Финансы ----------
router.get(
  "/finances",
  authenticate,
  requirePermission("finances:view"),
  (req: AuthRequest, res) => {
    try {
      const year = String(parseYear(req.query.year));

      const data = months(() => ({
        prepayment: 0,
        deliveryPayment: 0,
        fuel: 0,
        salary: 0,
      }));

      const incomeRows = sqlite
        .prepare(
          `SELECT substr(payment_date, 6, 2) AS m, income_type AS key,
                  SUM(amount) AS total, COUNT(*) AS cnt
           FROM incomes WHERE substr(payment_date, 1, 4) = ?
           GROUP BY m, key`,
        )
        .all(year) as MonthRow[];
      for (const r of incomeRows) {
        const row = data[Number(r.m) - 1];
        if (!row) continue;
        if (r.key === "prepayment") row.prepayment += r.total;
        else row.deliveryPayment += r.total;
      }

      const expenseRows = sqlite
        .prepare(
          `SELECT substr(date_time, 6, 2) AS m, expense_type AS key,
                  SUM(amount) AS total, COUNT(*) AS cnt
           FROM expenses WHERE substr(date_time, 1, 4) = ?
           GROUP BY m, key`,
        )
        .all(year) as MonthRow[];
      for (const r of expenseRows) {
        const row = data[Number(r.m) - 1];
        if (!row) continue;
        if (r.key === "salary") row.salary += r.total;
        else row.fuel += r.total;
      }

      const byMethod = sqlite
        .prepare(
          `SELECT payment_method AS key, SUM(amount) AS total
           FROM incomes WHERE substr(payment_date, 1, 4) = ?
           GROUP BY payment_method`,
        )
        .all(year) as { key: string; total: number }[];

      const unpaid = sqlite
        .prepare(
          `SELECT COALESCE(SUM(amount), 0) AS total FROM incomes
           WHERE is_paid = 0 AND substr(payment_date, 1, 4) = ?`,
        )
        .get(year) as { total: number };

      res.json({
        year: Number(year),
        years: yearsFrom([
          "SELECT DISTINCT substr(payment_date, 1, 4) AS y FROM incomes",
          "SELECT DISTINCT substr(date_time, 1, 4) AS y FROM expenses",
        ]),
        months: data,
        incomeByMethod: byMethod,
        unpaidIncome: unpaid.total,
      });
    } catch (error) {
      res.status(500).json({ error: "Ошибка получения статистики", details: String(error) });
    }
  },
);

// ---------- Заявки и доставки ----------
router.get(
  "/operations",
  authenticate,
  requirePermission("statistics:operations"),
  (req: AuthRequest, res) => {
    try {
      const year = String(parseYear(req.query.year));

      const data = months(() => ({ orders: 0, deliveries: 0, volume: 0 }));

      for (const r of sqlite
        .prepare(
          `SELECT substr(created_at, 6, 2) AS m, COUNT(*) AS cnt FROM orders
           WHERE substr(created_at, 1, 4) = ? AND status != 'draft' GROUP BY m`,
        )
        .all(year) as MonthRow[]) {
        const row = data[Number(r.m) - 1];
        if (row) row.orders = r.cnt;
      }

      for (const r of sqlite
        .prepare(
          `SELECT substr(date_time, 6, 2) AS m, COUNT(*) AS cnt, COALESCE(SUM(volume), 0) AS total
           FROM deliveries WHERE substr(date_time, 1, 4) = ? GROUP BY m`,
        )
        .all(year) as MonthRow[]) {
        const row = data[Number(r.m) - 1];
        if (row) {
          row.deliveries = r.cnt;
          row.volume = r.total;
        }
      }

      const byStatus = sqlite
        .prepare(
          `SELECT status AS key, COUNT(*) AS total FROM orders
           WHERE substr(created_at, 1, 4) = ? GROUP BY status`,
        )
        .all(year);

      // День недели доставки: 0 = вс … 6 = сб
      const byWeekday = sqlite
        .prepare(
          `SELECT CAST(strftime('%w', substr(date_time, 1, 10)) AS INTEGER) AS day, COUNT(*) AS total
           FROM deliveries WHERE substr(date_time, 1, 4) = ? GROUP BY day`,
        )
        .all(year);

      const topClients = sqlite
        .prepare(
          `SELECT c.id AS id,
                  CASE WHEN c.type = 'legal' THEN c.organization_name
                       ELSE TRIM(COALESCE(c.last_name, '') || ' ' || COALESCE(c.first_name, '')) END AS name,
                  COUNT(o.id) AS orders
           FROM orders o JOIN clients c ON c.id = o.client_id
           WHERE substr(o.created_at, 1, 4) = ? AND o.status != 'draft'
           GROUP BY c.id ORDER BY orders DESC LIMIT 5`,
        )
        .all(year);

      const topDrivers = sqlite
        .prepare(
          `SELECT u.id AS id, TRIM(u.last_name || ' ' || u.first_name) AS name,
                  COUNT(d.id) AS deliveries, COALESCE(SUM(d.volume), 0) AS volume
           FROM deliveries d JOIN users u ON u.id = d.driver_id
           WHERE substr(d.date_time, 1, 4) = ?
           GROUP BY u.id ORDER BY deliveries DESC LIMIT 5`,
        )
        .all(year);

      res.json({
        year: Number(year),
        years: yearsFrom([
          "SELECT DISTINCT substr(created_at, 1, 4) AS y FROM orders",
          "SELECT DISTINCT substr(date_time, 1, 4) AS y FROM deliveries",
        ]),
        months: data,
        ordersByStatus: byStatus,
        deliveriesByWeekday: byWeekday,
        topClients,
        topDrivers,
      });
    } catch (error) {
      res.status(500).json({ error: "Ошибка получения статистики", details: String(error) });
    }
  },
);

// ---------- Стяжка ----------
router.get(
  "/works",
  authenticate,
  requirePermission("statistics:works"),
  (req: AuthRequest, res) => {
    try {
      const year = String(parseYear(req.query.year));

      const data = months(() => ({ works: 0, area: 0, revenue: 0 }));
      for (const r of sqlite
        .prepare(
          `SELECT substr(w.date, 6, 2) AS m, COUNT(*) AS cnt,
                  COALESCE(SUM(w.area), 0) AS area, COALESCE(SUM(w.price), 0) AS revenue
           FROM works w LEFT JOIN work_statuses s ON s.code = w.status
           WHERE substr(w.date, 1, 4) = ? AND COALESCE(s.show_in_calendar, 1) = 1
           GROUP BY m`,
        )
        .all(year) as (MonthRow & { area: number; revenue: number })[]) {
        const row = data[Number(r.m) - 1];
        if (row) {
          row.works = r.cnt;
          row.area = Math.round(r.area);
          row.revenue = r.revenue;
        }
      }

      const byStatus = sqlite
        .prepare(
          `SELECT w.status AS key, COALESCE(s.name, w.status) AS name, s.color AS color,
                  COUNT(*) AS total
           FROM works w LEFT JOIN work_statuses s ON s.code = w.status
           WHERE substr(w.date, 1, 4) = ?
           GROUP BY w.status ORDER BY COALESCE(s.sort_order, 999)`,
        )
        .all(year);

      const byType = sqlite
        .prepare(
          `SELECT w.work_type AS key, COALESCE(t.name, w.work_type) AS name,
                  COUNT(*) AS total, COALESCE(SUM(w.area), 0) AS area
           FROM works w LEFT JOIN work_types t ON t.code = w.work_type
           LEFT JOIN work_statuses s ON s.code = w.status
           WHERE substr(w.date, 1, 4) = ? AND COALESCE(s.show_in_calendar, 1) = 1
           GROUP BY w.work_type ORDER BY total DESC`,
        )
        .all(year);

      const byTeam = sqlite
        .prepare(
          `SELECT t.id AS id, t.name AS name, COUNT(*) AS works,
                  COALESCE(SUM(w.area), 0) AS area
           FROM works w JOIN teams t ON t.id = w.team_id
           LEFT JOIN work_statuses s ON s.code = w.status
           WHERE substr(w.date, 1, 4) = ? AND COALESCE(s.show_in_calendar, 1) = 1
           GROUP BY t.id ORDER BY area DESC LIMIT 8`,
        )
        .all(year);

      res.json({
        year: Number(year),
        years: yearsFrom(["SELECT DISTINCT substr(date, 1, 4) AS y FROM works"]),
        months: data,
        byStatus,
        byType,
        byTeam,
      });
    } catch (error) {
      res.status(500).json({ error: "Ошибка получения статистики", details: String(error) });
    }
  },
);

export default router;
