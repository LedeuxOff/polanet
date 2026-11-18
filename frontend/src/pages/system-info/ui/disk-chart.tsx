import { DiskInfo } from "@/lib/api/system-info-api";
import { HardDriveIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const formatGB = (gb: number) =>
  gb >= 1024 ? `${(gb / 1024).toFixed(1)} ТБ` : `${gb.toFixed(1)} ГБ`;

export const loadTone = (percent: number, high = 70, critical = 90) =>
  percent > critical
    ? { bar: "bg-red-500", text: "text-red-500", label: "Критично" }
    : percent > high
      ? { bar: "bg-amber-500", text: "text-amber-500", label: "Высокая" }
      : { bar: "bg-emerald-500", text: "text-emerald-500", label: "Норма" };

export const DiskChart = ({ disk }: { disk: DiskInfo }) => {
  const tone = loadTone(disk.usagePercent);
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-white/15">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
          <HardDriveIcon className="h-4 w-4" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
            {disk.mount}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {disk.type} · {formatGB(disk.size)}
          </span>
        </div>
        <span className={cn("text-lg font-bold tabular-nums", tone.text)}>
          {disk.usagePercent}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div
          className={cn("h-full rounded-full transition-all duration-700", tone.bar)}
          style={{ width: `${disk.usagePercent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs tabular-nums text-slate-500 dark:text-slate-400">
        <span>Занято {formatGB(disk.used)}</span>
        <span>Свободно {formatGB(disk.free)}</span>
      </div>
    </div>
  );
};
