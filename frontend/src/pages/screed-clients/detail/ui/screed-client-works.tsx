import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { worksApi } from "@/lib/api";
import type { Work } from "@/lib/types";
import { cn, getFormattedAmount } from "@/lib/utils";
import { fromDateKey, getStatusClasses } from "@/pages/works/consts";

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
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Работы {total > 0 && <span className="text-muted-foreground">({total})</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isLoading && works.length === 0 ? (
          <div className="text-sm text-muted-foreground">Загрузка...</div>
        ) : (
          works.map((w) => (
            <Link
              key={w.id}
              to="/works"
              search={{ workId: w.id }}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50 dark:border-white/20 dark:hover:bg-white/5"
            >
              <span className="font-medium">{fromDateKey(w.date).toLocaleDateString("ru-RU")}</span>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-xs",
                  getStatusClasses(w.statusInfo.color),
                )}
              >
                {w.statusInfo.name}
              </span>
              <span className="flex-1 min-w-[160px] truncate text-muted-foreground">
                {w.address || "Адрес не указан"}
              </span>
              {w.area ? <span>{w.area} м²</span> : null}
              {w.price ? <span>{getFormattedAmount(w.price)} ₽</span> : null}
            </Link>
          ))
        )}
        {works.length < total && limit < 100 && (
          <button
            type="button"
            className="self-start text-sm text-blue-600 hover:underline dark:text-blue-300"
            onClick={() => setLimit((l) => Math.min(l + 20, 100))}
          >
            Показать ещё
          </button>
        )}
      </CardContent>
    </Card>
  );
};
