import type { StatusColor, WorkClient } from "@/lib/types";

// Палитра цветов статусов. Классы указаны целиком, чтобы Tailwind их не вырезал
export const STATUS_COLOR_CLASSES: Record<StatusColor, string> = {
  amber:
    "bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-500/25 dark:border-amber-300/40 dark:text-amber-50",
  violet:
    "bg-violet-100 border-violet-300 text-violet-900 dark:bg-violet-500/25 dark:border-violet-300/40 dark:text-violet-50",
  orange:
    "bg-orange-100 border-orange-300 text-orange-900 dark:bg-orange-500/25 dark:border-orange-300/40 dark:text-orange-50",
  blue: "bg-blue-100 border-blue-300 text-blue-900 dark:bg-blue-500/25 dark:border-blue-300/40 dark:text-blue-50",
  green:
    "bg-green-100 border-green-300 text-green-900 dark:bg-green-500/25 dark:border-green-300/40 dark:text-green-50",
  zinc: "bg-zinc-100 border-zinc-300 text-zinc-600 dark:bg-white/5 dark:border-white/20 dark:text-zinc-300",
  red: "bg-red-100 border-red-300 text-red-900 dark:bg-red-500/25 dark:border-red-300/40 dark:text-red-50",
  slate:
    "bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-500/25 dark:border-slate-300/40 dark:text-slate-50",
  cyan: "bg-cyan-100 border-cyan-300 text-cyan-900 dark:bg-cyan-500/25 dark:border-cyan-300/40 dark:text-cyan-50",
  pink: "bg-pink-100 border-pink-300 text-pink-900 dark:bg-pink-500/25 dark:border-pink-300/40 dark:text-pink-50",
};

export const STATUS_COLOR_NAMES: Record<StatusColor, string> = {
  amber: "Жёлтый",
  violet: "Фиолетовый",
  orange: "Оранжевый",
  blue: "Синий",
  green: "Зелёный",
  zinc: "Серый",
  red: "Красный",
  slate: "Графитовый",
  cyan: "Бирюзовый",
  pink: "Розовый",
};

export const getStatusClasses = (color: string | null | undefined) => {
  const key: StatusColor =
    color && color in STATUS_COLOR_CLASSES ? (color as StatusColor) : "slate";
  return STATUS_COLOR_CLASSES[key];
};

export const STRENGTH_OPTIONS = ["M100", "M150", "M200", "M250", "M300"];

export const DAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

// Значение «Без бригады» в селектах и фильтре
export const NO_TEAM = "none";

// Строки календаря — часы 08:00 … 23:00; рабочий день длится до 24:00
export const FIRST_HOUR = 8;
export const LAST_HOUR = 23;
export const DAY_START = FIRST_HOUR * 60; // в минутах от полуночи
export const DAY_END = (LAST_HOUR + 1) * 60; // 24:00
export const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR + 1 }, (_, i) => FIRST_HOUR + i);
// Шаг времени в форме, минуты
export const TIME_STEP = 30;

export const formatHour = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

/** HH:MM → минуты от полуночи */
export const timeToMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/** минуты от полуночи → HH:MM */
export const minutesToTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

// Варианты времени в форме: каждые 30 минут с 08:00 до 24:00
export const TIME_OPTIONS = Array.from({ length: (DAY_END - DAY_START) / TIME_STEP + 1 }, (_, i) =>
  minutesToTime(DAY_START + i * TIME_STEP),
);

/** Интервал работы в минутах, прижатый к рабочему диапазону; без времени — весь диапазон */
export const getWorkRange = (work: { startTime: string | null; endTime: string | null }) => {
  const start = work.startTime ? timeToMinutes(work.startTime) : DAY_START;
  const end = work.endTime ? timeToMinutes(work.endTime) : DAY_END;
  const s = Math.min(Math.max(start, DAY_START), DAY_END - TIME_STEP);
  const e = Math.min(Math.max(end, s + TIME_STEP), DAY_END);
  return { start: s, end: e };
};

/** Новый интервал при переносе на другое начало: длительность сохраняется, конец не позже 24:00 */
export const moveRange = (
  work: { startTime: string | null; endTime: string | null },
  newStart: string,
) => {
  const { start, end } = getWorkRange(work);
  const duration = end - start;
  let s = Math.max(DAY_START, Math.min(timeToMinutes(newStart), DAY_END - TIME_STEP));
  if (s + duration > DAY_END) s = Math.max(DAY_START, DAY_END - duration);
  return { startTime: minutesToTime(s), endTime: minutesToTime(s + duration) };
};

/** Попадает ли работа в часовую строку [hour:00, hour+1:00) — тогда она дублируется в этой ячейке */
export const workCoversHour = (
  work: { startTime: string | null; endTime: string | null },
  hour: number,
) => {
  const { start, end } = getWorkRange(work);
  return start < (hour + 1) * 60 && end > hour * 60;
};

export const formatWorkTime = (work: { startTime: string | null; endTime: string | null }) => {
  const { start, end } = getWorkRange(work);
  return `${minutesToTime(start)}–${minutesToTime(end)}`;
};

/** Дата → YYYY-MM-DD по локальному времени (toISOString сдвигает дату в UTC) */
export const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** YYYY-MM-DD → Date в локальной полуночи */
export const fromDateKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  // new Date(2, ...) даёт 1902 год — выставляем год явно
  date.setFullYear(y);
  return date;
};

/** Полная корректная дата в разумном диапазоне (не промежуточное значение при вводе) */
export const isValidDateKey = (key: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  const year = Number(key.slice(0, 4));
  return year >= 2000 && year <= 2100 && toDateKey(fromDateKey(key)) === key;
};

export const getMonday = (date: Date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
};

export const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const formatDayMonth = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;

export const formatDateLong = (key: string) =>
  fromDateKey(key).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const getClientName = (client: WorkClient | null) => {
  if (!client) return "Без клиента";
  return (
    [client.lastName, client.firstName, client.middleName].filter(Boolean).join(" ") || "Без имени"
  );
};

/** Объём смеси, м³: площадь (м²) × толщина (мм) / 1000 */
export const getVolume = (area: number | null, thickness: number | null) =>
  area && thickness ? Math.round(area * thickness) / 1000 : null;
