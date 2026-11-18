import { cn } from "@/lib/utils";

interface DonutChartProps {
  value: number; // 0-100
  label: string;
  /** Tailwind-класс цвета дуги, например "text-blue-500" */
  colorClass: string;
  size?: number;
}

/** Кольцевой индикатор загрузки; цвета через currentColor — корректно в обеих темах */
export const DonutChart = ({ value, label, colorClass, size = 180 }: DonutChartProps) => {
  const v = Math.min(Math.max(value, 0), 100);
  const r = 42;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="9"
          className="stroke-slate-100 dark:stroke-white/10"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={`${(v / 100) * c} ${c}`}
          className={cn("transition-all duration-700 ease-out", colorClass)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
          {Math.round(v)}%
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
      </div>
    </div>
  );
};
