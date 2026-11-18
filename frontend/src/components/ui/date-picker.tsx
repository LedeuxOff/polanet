import { useEffect, useMemo, useState } from "react";
import {
  CalendarClockIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/* ---------- утилиты ---------- */

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleString("ru-RU", { month: "short" }).replace(".", ""),
);

const pad = (n: number) => String(n).padStart(2, "0");

/** Date → "YYYY-MM-DD" в локальном времени (без сдвига по таймзоне) */
export const toDateValue = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** "YYYY-MM-DD" (или ISO-строка) → локальная Date */
export const parseDateValue = (value?: string | null): Date | null => {
  if (!value) return null;
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

export const formatDateValue = (value?: string | null) => {
  const d = parseDateValue(value);
  return d ? `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}` : "";
};

const sameDay = (a: Date | null, b: Date | null) =>
  !!a &&
  !!b &&
  a.getDate() === b.getDate() &&
  a.getMonth() === b.getMonth() &&
  a.getFullYear() === b.getFullYear();

/* ---------- панель календаря ---------- */

type View = "days" | "months" | "years";

interface CalendarPanelProps {
  value?: string | null;
  onSelect: (value: string) => void;
  onClear?: () => void;
}

const navBtn =
  "flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white";

const cellBase =
  "flex items-center justify-center rounded-xl text-sm tabular-nums transition-colors";

export const CalendarPanel = ({ value, onSelect, onClear }: CalendarPanelProps) => {
  const selected = parseDateValue(value);
  const [cursor, setCursor] = useState(() => selected ?? new Date());
  const [view, setView] = useState<View>("days");

  useEffect(() => {
    if (selected) setCursor(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const today = new Date();

  const days = useMemo(() => {
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7; // Пн = 0
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(year, month, i - offset + 1);
      return { date, isCurrentMonth: date.getMonth() === month };
    });
  }, [year, month]);

  const yearStart = Math.floor(year / 12) * 12;

  const shift = (dir: -1 | 1) => {
    if (view === "days") setCursor(new Date(year, month + dir, 1));
    if (view === "months") setCursor(new Date(year + dir, month, 1));
    if (view === "years") setCursor(new Date(year + dir * 12, month, 1));
  };

  const title =
    view === "days"
      ? cursor.toLocaleString("ru-RU", { month: "long", year: "numeric" }).replace(" г.", "")
      : view === "months"
        ? String(year)
        : `${yearStart} – ${yearStart + 11}`;

  return (
    <div className="flex w-[296px] flex-col gap-3 p-3">
      {/* Навигация */}
      <div className="flex items-center justify-between">
        <button type="button" className={navBtn} onClick={() => shift(-1)} aria-label="Назад">
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setView(view === "days" ? "months" : "years")}
          disabled={view === "years"}
          className="rounded-xl px-3 py-1.5 text-sm font-semibold capitalize text-slate-900 transition-colors hover:bg-slate-100 disabled:hover:bg-transparent dark:text-slate-100 dark:hover:bg-white/10"
        >
          {title}
        </button>
        <button type="button" className={navBtn} onClick={() => shift(1)} aria-label="Вперёд">
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      {view === "days" && (
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d, i) => (
            <span
              key={d}
              className={cn(
                "py-1 text-center text-[11px] font-medium uppercase text-slate-400",
                i > 4 && "text-rose-400",
              )}
            >
              {d}
            </span>
          ))}
          {days.map(({ date, isCurrentMonth }) => {
            const isSel = sameDay(date, selected);
            const isToday = sameDay(date, today);
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => onSelect(toDateValue(date))}
                className={cn(
                  cellBase,
                  "h-9",
                  isSel
                    ? "bg-blue-600 font-semibold text-white shadow-sm dark:bg-blue-500"
                    : isToday
                      ? "font-semibold text-blue-600 ring-1 ring-inset ring-blue-200 hover:bg-blue-50 dark:text-blue-300 dark:ring-blue-400/40 dark:hover:bg-white/10"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10",
                  !isCurrentMonth && !isSel && "text-slate-300 dark:text-slate-500",
                )}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      )}

      {view === "months" && (
        <div className="grid grid-cols-3 gap-2">
          {MONTHS.map((name, i) => {
            const isSel = selected?.getFullYear() === year && selected?.getMonth() === i;
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setCursor(new Date(year, i, 1));
                  setView("days");
                }}
                className={cn(
                  cellBase,
                  "h-12 capitalize",
                  isSel
                    ? "bg-blue-600 font-semibold text-white dark:bg-blue-500"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10",
                )}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}

      {view === "years" && (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 12 }, (_, i) => yearStart + i).map((y) => {
            const isSel = selected?.getFullYear() === y;
            return (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setCursor(new Date(y, month, 1));
                  setView("months");
                }}
                className={cn(
                  cellBase,
                  "h-12",
                  isSel
                    ? "bg-blue-600 font-semibold text-white dark:bg-blue-500"
                    : y === today.getFullYear()
                      ? "font-semibold text-blue-600 hover:bg-slate-100 dark:text-blue-300 dark:hover:bg-white/10"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10",
                )}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}

      {/* Низ */}
      <div className="flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
        <button
          type="button"
          onClick={() => onSelect(toDateValue(today))}
          className="h-9 flex-1 rounded-xl bg-slate-100 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/20"
        >
          Сегодня
        </button>
        {onClear && value && (
          <button
            type="button"
            onClick={onClear}
            className="h-9 flex-1 rounded-xl bg-red-50 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/20 dark:text-red-200 dark:hover:bg-red-500/30"
          >
            Сбросить
          </button>
        )}
      </div>
    </div>
  );
};

/** Классы выпадающей панели календаря */
export const calendarPopoverClass =
  "z-50 w-auto rounded-3xl border border-slate-200 bg-white p-0 shadow-xl dark:border-white/20 dark:bg-zinc-900/90 dark:backdrop-blur-xl";

/* ---------- поле формы ---------- */

interface DatePickerProps {
  id?: string;
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Показывать кнопку очистки (для необязательных полей) */
  clearable?: boolean;
  /** Рендерить календарь без портала — для полей внутри Dialog/Drawer */
  inModal?: boolean;
  className?: string;
}

export const DatePicker = ({
  id,
  value,
  onChange,
  placeholder = "Выберите дату",
  disabled,
  clearable = true,
  inModal,
  className,
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const label = formatDateValue(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-2xl border border-input bg-background px-3 text-left text-sm transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-white/10 dark:backdrop-blur-xl dark:hover:border-white/30",
            open &&
              "border-blue-400 ring-2 ring-blue-100 dark:border-blue-400/60 dark:ring-blue-400/20",
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
          <span
            className={cn(
              "flex-1 truncate tabular-nums",
              label ? "text-slate-900 dark:text-slate-100" : "text-muted-foreground",
            )}
          >
            {label || placeholder}
          </span>
          {clearable && value && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Очистить"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <XIcon className="h-3.5 w-3.5" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={calendarPopoverClass}
        sideOffset={6}
        align="start"
        portal={!inModal}
        data-vaul-no-drag
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <CalendarPanel
          value={value}
          onSelect={(v) => {
            onChange(v);
            setOpen(false);
          }}
          onClear={
            clearable
              ? () => {
                  onChange("");
                  setOpen(false);
                }
              : undefined
          }
        />
      </PopoverContent>
    </Popover>
  );
};

/* ---------- дата + время ---------- */

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

/** Текущие дата и время в формате "YYYY-MM-DDTHH:mm" (локальное время) */
export const nowDateTimeValue = () => {
  const d = new Date();
  return `${toDateValue(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const splitDateTime = (value?: string | null) => {
  const [date = "", time = ""] = (value ?? "").split("T");
  const [h, m] = time.split(":").map(Number);
  return {
    date: date.slice(0, 10),
    hours: Number.isFinite(h) ? h : null,
    minutes: Number.isFinite(m) ? m : null,
  };
};

const TimeColumn = ({
  values,
  selected,
  onSelect,
  label,
}: {
  values: number[];
  selected: number | null;
  onSelect: (value: number) => void;
  label: string;
}) => {
  const list =
    selected !== null && !values.includes(selected)
      ? [...values, selected].sort((a, b) => a - b)
      : values;
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="px-1 text-center text-[11px] font-medium uppercase text-slate-400">
        {label}
      </span>
      <div className="flex h-[188px] flex-col gap-1 overflow-y-auto overscroll-contain pr-0.5 sm:h-[252px]">
        {list.map((v) => (
          <button
            key={v}
            type="button"
            ref={(el) => {
              if (el && v === selected) el.scrollIntoView({ block: "nearest" });
            }}
            onClick={() => onSelect(v)}
            className={cn(
              cellBase,
              "h-8 shrink-0",
              v === selected
                ? "bg-blue-600 font-semibold text-white dark:bg-blue-500"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10",
            )}
          >
            {pad(v)}
          </button>
        ))}
      </div>
    </div>
  );
};

interface DateTimePickerProps {
  id?: string;
  /** "YYYY-MM-DDTHH:mm" */
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Рендерить без портала — для полей внутри Dialog/Drawer */
  inModal?: boolean;
  className?: string;
}

/** Поле даты и времени с кастомным календарём и выбором часов/минут */
export const DateTimePicker = ({
  id,
  value,
  onChange,
  placeholder = "Выберите дату и время",
  disabled,
  inModal,
  className,
}: DateTimePickerProps) => {
  const [open, setOpen] = useState(false);
  const { date, hours, minutes } = splitDateTime(value);

  const emit = (next: { date?: string; hours?: number; minutes?: number }) => {
    const d = next.date ?? date ?? toDateValue(new Date());
    const h = next.hours ?? hours ?? 9;
    const m = next.minutes ?? minutes ?? 0;
    onChange(`${d || toDateValue(new Date())}T${pad(h)}:${pad(m)}`);
  };

  const label =
    date && hours !== null && minutes !== null
      ? `${formatDateValue(date)}, ${pad(hours)}:${pad(minutes)}`
      : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-2xl border border-input bg-background px-3 text-left text-sm transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-white/10 dark:backdrop-blur-xl dark:hover:border-white/30",
            open &&
              "border-blue-400 ring-2 ring-blue-100 dark:border-blue-400/60 dark:ring-blue-400/20",
            className,
          )}
        >
          <CalendarClockIcon className="h-4 w-4 shrink-0 text-slate-400" />
          <span
            className={cn(
              "flex-1 truncate tabular-nums",
              label ? "text-slate-900 dark:text-slate-100" : "text-muted-foreground",
            )}
          >
            {label || placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={calendarPopoverClass}
        sideOffset={6}
        align="start"
        portal={!inModal}
        data-vaul-no-drag
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col sm:flex-row">
          <CalendarPanel value={date} onSelect={(d) => emit({ date: d })} />
          <div className="flex flex-col gap-3 border-t border-slate-100 p-3 sm:w-[140px] sm:border-l sm:border-t-0 dark:border-white/10">
            <div className="flex gap-2">
              <TimeColumn
                label="Час"
                values={HOURS}
                selected={hours}
                onSelect={(h) => emit({ hours: h })}
              />
              <TimeColumn
                label="Мин"
                values={MINUTES}
                selected={minutes}
                onSelect={(m) => emit({ minutes: m })}
              />
            </div>
            <div className="mt-auto flex gap-2 sm:flex-col">
              <button
                type="button"
                onClick={() => onChange(nowDateTimeValue())}
                className="h-9 flex-1 rounded-xl bg-slate-100 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/20"
              >
                Сейчас
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 flex-1 rounded-xl bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500/80 dark:hover:bg-blue-500"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
