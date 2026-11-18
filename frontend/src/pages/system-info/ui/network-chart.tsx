import { NetworkInfo } from "@/lib/api/system-info-api";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

export const NetworkChart = ({ network }: { network: NetworkInfo }) => (
  <div className="flex flex-col gap-3">
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1 rounded-2xl bg-blue-50 p-4 dark:bg-blue-500/10">
        <span className="flex items-center gap-1.5 text-xs font-medium text-blue-700/80 dark:text-blue-200/80">
          <ArrowUpIcon className="h-3.5 w-3.5" /> Отдано
        </span>
        <span className="text-lg font-bold tabular-nums text-blue-700 dark:text-blue-200">
          {network.bytesSentFormatted}
        </span>
      </div>
      <div className="flex flex-col gap-1 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700/80 dark:text-emerald-200/80">
          <ArrowDownIcon className="h-3.5 w-3.5" /> Получено
        </span>
        <span className="text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-200">
          {network.bytesReceivedFormatted}
        </span>
      </div>
    </div>
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-2xl border border-slate-200 p-4 text-sm dark:border-white/15">
      <dt className="text-slate-500 dark:text-slate-400">Интерфейс</dt>
      <dd className="truncate font-mono text-slate-900 dark:text-slate-100">
        {network.interfaceName}
      </dd>
      <dt className="text-slate-500 dark:text-slate-400">IP</dt>
      <dd className="truncate font-mono text-slate-900 dark:text-slate-100">{network.ip}</dd>
      <dt className="text-slate-500 dark:text-slate-400">MAC</dt>
      <dd className="truncate font-mono text-slate-900 dark:text-slate-100">{network.mac}</dd>
    </dl>
  </div>
);
