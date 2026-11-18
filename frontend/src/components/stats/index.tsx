import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ReactNode, useEffect, useState } from "react";
import { listCardClass } from "@/components/data-list";
import { cn } from "@/lib/utils";

/* ---------- форматирование ---------- */

export const MONTH_SHORT = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];

export const formatRub = (value: number) => `${Math.round(value).toLocaleString("ru-RU")} ₽`;

/** Компактная сумма для осей: 1,2 млн / 350 тыс */
export const formatRubCompact = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000)
    return `${(value / 1_000_000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} млн`;
  if (abs >= 1_000) return `${Math.round(value / 1_000).toLocaleString("ru-RU")} тыс`;
  return String(Math.round(value));
};

export const formatNumber = (value: number, digits = 0) =>
  value.toLocaleString("ru-RU", { maximumFractionDigits: digits });

/** Цвета серий — CSS-переменные из globals.css (свои значения для тёмной темы) */
export const SERIES = {
  blue: "var(--series-1)",
  orange: "var(--series-2)",
  aqua: "var(--series-3)",
  yellow: "var(--series-4)",
  magenta: "var(--series-5)",
  green: "var(--series-6)",
  violet: "var(--series-7)",
  red: "var(--series-8)",
} as const;

export const SERIES_ORDER = Object.values(SERIES);

/** Общие пропсы осей/сетки recharts */
export const axisProps = {
  tick: { fontSize: 12, fill: "var(--chart-axis)" },
  axisLine: false,
  tickLine: false,
} as const;
export const gridProps = { stroke: "var(--chart-grid)", vertical: false } as const;

/* ---------- загрузка по году ---------- */

export const useYearStats = <T,>(load: (year: number) => Promise<T>) => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    load(year)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Ошибка загрузки"))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  return { year, setYear, data, isLoading, error };
};

/* ---------- шапка с выбором года ---------- */

export const StatsHead = ({
  icon,
  iconClassName,
  title,
  description,
  years,
  year,
  onYearChange,
}: {
  icon: ReactNode;
  iconClassName?: string;
  title: string;
  description: string;
  years: number[];
  year: number;
  onYearChange: (year: number) => void;
}) => {
  const list = years.length ? years : [year];
  return (
    <div
      className={cn(
        listCardClass,
        "flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6",
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl [&>svg]:h-6 [&>svg]:w-6",
            iconClassName,
          )}
        >
          {icon}
        </div>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
            {title}
          </h1>
          <span className="text-sm text-slate-500 dark:text-slate-300">{description}</span>
        </div>
      </div>
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1">
        <div className="flex shrink-0 gap-1 rounded-2xl bg-slate-200/70 p-1 dark:bg-white/10">
          {list.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => onYearChange(y)}
              aria-pressed={y === year}
              className={cn(
                "h-9 rounded-xl px-4 text-sm font-medium tabular-nums transition-colors",
                y === year
                  ? "bg-white text-slate-900 shadow-sm dark:bg-white/15 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white",
              )}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- KPI ---------- */

export const KpiTile = ({
  label,
  value,
  hint,
  icon,
  iconClassName,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ReactNode;
  iconClassName?: string;
  valueClassName?: string;
}) => (
  <div className={cn(listCardClass, "flex flex-col gap-3 p-4 sm:p-5")}>
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-300">{label}</span>
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300 [&>svg]:h-4 [&>svg]:w-4",
          iconClassName,
        )}
      >
        {icon}
      </div>
    </div>
    <span
      className={cn(
        "text-2xl font-bold leading-none tracking-tight tabular-nums text-slate-900 dark:text-slate-100 sm:text-3xl",
        valueClassName,
      )}
    >
      {value}
    </span>
    {hint && <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
  </div>
);

/* ---------- легенда и тултип ---------- */

export const ChartLegend = ({ items }: { items: { label: string; color: string }[] }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
    {items.map((i) => (
      <span
        key={i.label}
        className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300"
      >
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: i.color }} />
        {i.label}
      </span>
    ))}
  </div>
);

type TooltipEntry = { name?: string; value?: number; color?: string; dataKey?: string | number };

/** Тултип для recharts: подпись + список значений с цветной меткой */
export const ChartTooltip = ({
  active,
  payload,
  label,
  formatValue = (v: number) => formatNumber(v),
  labelFormatter,
  footer,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  formatValue?: (v: number) => string;
  labelFormatter?: (label: string | number) => string;
  footer?: (payload: TooltipEntry[]) => ReactNode;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[160px] rounded-2xl border border-slate-200 bg-white/95 p-3 text-sm shadow-lg backdrop-blur dark:border-white/15 dark:bg-zinc-900/95">
      <div className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
        {labelFormatter && label !== undefined ? labelFormatter(label) : label}
      </div>
      <div className="flex flex-col gap-1">
        {payload.map((p) => (
          <div
            key={String(p.dataKey ?? p.name)}
            className="flex items-center justify-between gap-4"
          >
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
              {formatValue(Number(p.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
      {footer && (
        <div className="mt-2 border-t border-slate-100 pt-2 dark:border-white/10">
          {footer(payload)}
        </div>
      )}
    </div>
  );
};

/* ---------- рейтинг (горизонтальные полосы) ---------- */

export const RankList = ({
  items,
  color = SERIES.blue,
  empty = "Нет данных за этот год",
}: {
  items: { key: string | number; label: string; value: number; display: string; sub?: string }[];
  color?: string;
  empty?: string;
}) => {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-white/20 dark:text-slate-400">
        {empty}
      </div>
    );
  }
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ol className="flex flex-col gap-3">
      {items.map((item, idx) => (
        <li key={item.key} className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold tabular-nums text-slate-500 dark:bg-white/10 dark:text-slate-300">
            {idx + 1}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                {item.label}
              </span>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {item.display}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(item.value / max) * 100}%`, background: color }}
              />
            </div>
            {item.sub && (
              <span className="text-xs text-slate-500 dark:text-slate-400">{item.sub}</span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
};

/** Пустое состояние графика */
export const ChartEmpty = ({ text = "Нет данных за этот год" }: { text?: string }) => (
  <div className="flex h-full min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500 dark:border-white/20 dark:text-slate-400">
    {text}
  </div>
);

/* ---------- кольцевая диаграмма с подписью в центре ---------- */

export const DonutBreakdown = ({
  items,
  formatValue = formatRub,
  centerLabel,
}: {
  items: { label: string; value: number; color: string }[];
  formatValue?: (v: number) => string;
  centerLabel: string;
}) => {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (!total) return <ChartEmpty />;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div className="relative h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              dataKey="value"
              nameKey="label"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={items.filter((i) => i.value > 0).length > 1 ? 2 : 0}
              stroke="var(--chart-surface)"
              strokeWidth={2}
              cornerRadius={4}
              isAnimationActive
            >
              {items.map((i) => (
                <Cell key={i.label} fill={i.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip formatValue={formatValue} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] uppercase tracking-wider text-slate-400">{centerLabel}</span>
          <span className="text-base font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {formatRubCompact(total)}
          </span>
        </div>
      </div>
      <ul className="flex w-full flex-col gap-2.5">
        {items.map((i) => (
          <li key={i.label} className="flex items-center gap-3 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: i.color }} />
            <span className="flex-1 text-slate-600 dark:text-slate-300">{i.label}</span>
            <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {formatValue(i.value)}
            </span>
            <span className="w-10 text-right text-xs tabular-nums text-slate-400">
              {Math.round((i.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
