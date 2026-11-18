import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRightIcon, ClipboardListIcon, MapPinIcon } from "lucide-react";
import { SectionCard, Shimmer } from "@/components/data-list";
import { worksApi } from "@/lib/api";
import type { Work } from "@/lib/types";
import { cn, getFormattedAmount } from "@/lib/utils";
import { fromDateKey, getStatusClasses } from "@/pages/works/consts";
import { worksLabel } from "../../ui/screed-client-identity";

interface Props {
  clientId: number;
}

const PAGE_SIZE = 5;

/** Работы клиента стяжки — со ссылкой в календарь */
export const ScreedClientWorks = ({ clientId }: Props) => {
  const [works, setWorks] = useState<Work[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    worksApi
      .list({ clientId, limit })
      .then((res) => {
        if (cancelled) return;
        setWorks(res.data);
        setTotal(res.pagination.totalRecords);
      })
      .catch(() => !cancelled && setWorks([]))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [clientId, limit]);

  if (!isLoading && total === 0) return null;

  return (
    <SectionCard
      icon={<ClipboardListIcon />}
      iconClassName="bg-teal-100 text-teal-600 dark:bg-teal-400/15 dark:text-teal-300"
      title="Работы"
      description={
        total > 0 ? `${worksLabel(total)} · нажмите, чтобы открыть в календаре` : undefined
      }
    >
      <div className="flex flex-col gap-2">
        {isLoading && works.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <Shimmer key={i} className="h-16 w-full rounded-2xl" />
            ))
          : works.map((w) => {
              const date = fromDateKey(w.date);
              return (
                <Link
                  key={w.id}
                  to="/works"
                  search={{ workId: w.id }}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-3 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-white/15 dark:hover:bg-white/5"
                >
                  {/* Дата «листком календаря» */}
                  <div className="flex w-12 shrink-0 flex-col items-center overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/15 dark:bg-white/5">
                    <span className="w-full bg-teal-500 py-0.5 text-center text-[10px] font-semibold uppercase text-white">
                      {date.toLocaleDateString("ru-RU", { month: "short" }).replace(".", "")}
                    </span>
                    <span className="py-1 text-lg font-bold leading-none tabular-nums text-slate-900 dark:text-slate-100">
                      {date.getDate()}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-xs",
                          getStatusClasses(w.statusInfo.color),
                        )}
                      >
                        {w.statusInfo.name}
                      </span>
                      <span className="text-xs text-slate-400">{date.getFullYear()}</span>
                    </div>
                    <span className="flex items-center gap-1.5 truncate text-sm text-slate-600 dark:text-slate-300">
                      <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{w.address || "Адрес не указан"}</span>
                    </span>
                  </div>

                  <div className="hidden flex-col items-end gap-0.5 sm:flex">
                    {w.price ? (
                      <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                        {getFormattedAmount(w.price)} ₽
                      </span>
                    ) : null}
                    {w.area ? (
                      <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
                        {w.area} м²
                      </span>
                    ) : null}
                  </div>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-500" />
                </Link>
              );
            })}

        {works.length < total && limit < 100 && (
          <button
            type="button"
            disabled={isLoading}
            className="mt-1 h-10 rounded-xl bg-slate-100 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/20"
            onClick={() => setLimit((l) => Math.min(l + 20, 100))}
          >
            Показать ещё ({total - works.length})
          </button>
        )}
      </div>
    </SectionCard>
  );
};
