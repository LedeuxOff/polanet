/**
 * Импорт данных из старой системы (стяжка) в PolaNet.
 *
 * Источник — SQLite-файл, сконвертированный из бэкапа MS SQL (old_system.sqlite).
 * Переносит:
 *   - Teams  → teams (бригады, строки календаря работ)
 *   - Orders → works (работы) + clients (клиенты, склейка по телефону)
 *     В старой системе работы были на целый день — ставим 08:00–24:00 (весь рабочий диапазон календаря)
 *
 * Скрипт идемпотентен: повторный запуск пропускает уже импортированные записи (по legacy_id).
 *
 * Использование (из папки backend):
 *   npx tsx src/scripts/import-legacy.ts [путь-к-old_system.sqlite] [путь-к-polanet.db]
 * По умолчанию: data/legacy/old_system.sqlite и data/polanet.db
 */
import Database from "better-sqlite3";
import fs from "fs";

const legacyPath = process.argv[2] || "data/legacy/old_system.sqlite";
const targetPath = process.argv[3] || "data/polanet.db";

type LegacyOrder = {
  Id: number;
  CustomerName: string | null;
  Phone: string | null;
  Address: string | null;
  Square: number | null;
  Thickness: number | null;
  Extras: string | null;
  Strength: string | null;
  Price: number | null;
  IsFinalPrice: number | null;
  State: string | null;
  TypeOfWork: string | null;
  TrunkLength: number | null;
  IsTransmixWay: number | null;
  PlannedDate: string | null;
  Start: string | null;
  End: string | null;
  ZamerId: string | null;
  TeamId: number | null;
};

const STATUS_MAP: Record<string, string> = {
  "Предварительная дата": "preliminary",
  Замер: "measurement",
  Перезвон: "callback",
  Выезд: "scheduled",
  "Заказ выполнен": "completed",
};

const WORK_TYPE_MAP: Record<string, string> = {
  Стандартный: "standard",
  "Аренда станка с бригадой": "machine_rent_with_team",
  "Аренда станка": "machine_rent",
};

// Достаёт первый российский номер из произвольной строки и приводит к 7XXXXXXXXXX
export function extractPhone(raw: string | null): string | null {
  if (!raw) return null;
  const chunks = raw.split(/[^\d\s\-()+ ‑‐‒–]+/);
  for (const chunk of chunks) {
    const digits = chunk.replace(/\D/g, "");
    if (digits.length === 11 && (digits[0] === "7" || digits[0] === "8")) {
      return "7" + digits.slice(1);
    }
    if (digits.length === 10 && digits[0] === "9") return "7" + digits;
  }
  return null;
}

const toIso = (value: string | null): string | null => {
  if (!value) return null;
  const d = new Date(value.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const cleanName = (name: string | null) => (name || "").replace(/\s+/g, " ").trim();

function main() {
  if (!fs.existsSync(legacyPath)) {
    console.error(`Не найден файл старой базы: ${legacyPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(targetPath)) {
    console.error(`Не найдена база PolaNet: ${targetPath}. Сначала запустите бэкенд (миграции).`);
    process.exit(1);
  }

  const legacy = new Database(legacyPath, { readonly: true });
  const target = new Database(targetPath);
  target.pragma("journal_mode = WAL");

  const hasWorks = target
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='works'")
    .get();
  if (!hasWorks) {
    console.error("В базе нет таблицы works. Запустите бэкенд, чтобы применилась миграция 0028.");
    process.exit(1);
  }

  const now = new Date().toISOString();

  // Замерщики: AspNetUsers.Id → RealName
  const measurers = new Map<string, string>();
  for (const u of legacy.prepare("SELECT Id, RealName, UserName FROM AspNetUsers").all() as {
    Id: string;
    RealName: string | null;
    UserName: string | null;
  }[]) {
    const name = cleanName(u.RealName) || cleanName(u.UserName);
    if (name && name !== "Без замера") measurers.set(u.Id, name);
  }

  const stats = {
    teams: 0,
    worksCreated: 0,
    worksSkipped: 0,
    clientsCreated: 0,
    clientsMatched: 0,
    withoutClient: 0,
  };

  const run = target.transaction(() => {
    // 1. Бригады
    const insertTeam = target.prepare(
      `INSERT OR IGNORE INTO teams (name, is_active, sort_order, legacy_id, created_at, updated_at)
       VALUES (?, 1, ?, ?, ?, ?)`,
    );
    const legacyTeams = legacy.prepare("SELECT Id, Name FROM Teams ORDER BY Id").all() as {
      Id: number;
      Name: string;
    }[];
    legacyTeams.forEach((t, i) => {
      stats.teams += insertTeam.run(cleanName(t.Name), i, t.Id, now, now).changes;
    });
    const teamByLegacy = new Map<number, number>();
    for (const t of target
      .prepare("SELECT id, legacy_id FROM teams WHERE legacy_id IS NOT NULL")
      .all() as { id: number; legacy_id: number }[]) {
      teamByLegacy.set(t.legacy_id, t.id);
    }

    // 2. Клиенты, уже существующие в PolaNet (по телефону)
    const clientByPhone = new Map<string, number>();
    for (const c of target
      .prepare("SELECT id, phone FROM clients WHERE phone IS NOT NULL")
      .all() as { id: number; phone: string }[]) {
      const p = extractPhone(c.phone);
      if (p && !clientByPhone.has(p)) clientByPhone.set(p, c.id);
    }

    const insertClient = target.prepare(
      `INSERT INTO clients (type, first_name, phone, created_at, updated_at)
       VALUES ('individual', ?, ?, ?, ?)`,
    );
    const workExists = target.prepare("SELECT 1 FROM works WHERE legacy_id = ?");
    const insertWork = target.prepare(
      `INSERT INTO works (
         date, start_time, end_time, team_id, client_id, address, area, thickness, strength, work_type, hose_length,
         is_transmix, price, is_final_price, status, measurer_name, notes, legacy_id,
         created_by_id, created_at, updated_at
       ) VALUES (?, '08:00', '24:00', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
    );

    // 3. Работы
    const orders = legacy.prepare("SELECT * FROM Orders ORDER BY Id").all() as LegacyOrder[];
    for (const o of orders) {
      if (workExists.get(o.Id)) {
        stats.worksSkipped++;
        continue;
      }

      const name = cleanName(o.CustomerName).replace(/\s*\+$/, "");
      const phone = extractPhone(o.Phone);
      let clientId: number | null = null;

      if (phone && clientByPhone.has(phone)) {
        clientId = clientByPhone.get(phone)!;
        stats.clientsMatched++;
      } else if (name || phone) {
        const createdAt = toIso(o.End) || now;
        clientId = Number(
          insertClient.run(name || "Без имени", phone, createdAt, createdAt).lastInsertRowid,
        );
        if (phone) clientByPhone.set(phone, clientId);
        stats.clientsCreated++;
      } else {
        stats.withoutClient++;
      }

      // Телефон, который не удалось распознать (например «переход»), не теряем — кладём в заметки
      const notesParts = [o.Extras?.trim()];
      if (o.Phone && !phone) notesParts.push(`Телефон (из старой системы): ${o.Phone.trim()}`);
      const notes = notesParts.filter(Boolean).join("\n\n") || null;

      const date = (o.Start || o.PlannedDate || o.End || now).slice(0, 10);
      const createdAt = toIso(o.End) || now;

      insertWork.run(
        date,
        o.TeamId != null ? (teamByLegacy.get(o.TeamId) ?? null) : null,
        clientId,
        o.Address?.trim() || null,
        o.Square || null,
        o.Thickness || null,
        o.Strength?.trim() || null,
        WORK_TYPE_MAP[o.TypeOfWork || ""] || "standard",
        o.TrunkLength || null,
        o.IsTransmixWay ? 1 : 0,
        o.Price != null && o.Price > 0 ? Math.round(o.Price) : null,
        o.IsFinalPrice ? 1 : 0,
        STATUS_MAP[o.State || ""] || "preliminary",
        (o.ZamerId && measurers.get(o.ZamerId)) || null,
        notes,
        o.Id,
        createdAt,
        createdAt,
      );
      stats.worksCreated++;
    }
  });

  run();

  legacy.close();
  target.close();

  console.log("Импорт завершён:");
  console.log(`  Бригад добавлено:      ${stats.teams}`);
  console.log(`  Работ добавлено:       ${stats.worksCreated}`);
  console.log(`  Работ пропущено:       ${stats.worksSkipped} (уже были импортированы)`);
  console.log(`  Клиентов создано:      ${stats.clientsCreated}`);
  console.log(`  Работ к уже известному клиенту:   ${stats.clientsMatched}`);
  console.log(`  Работ без клиента:     ${stats.withoutClient}`);
}

main();
