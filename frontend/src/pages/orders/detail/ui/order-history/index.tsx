import { Order, OrderHistory as OrderHistoryEntry } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { HistoryIcon } from "lucide-react";
import { useIsMobile } from "@/hooks";
import { cn } from "@/lib/utils";
import { ListPagination } from "../shared/list-pagination";
import { HistoryItem } from "./ui/history-item";
import { actionFilterMap, HistoryFilter, historyFilters } from "./consts";
import { getDayKey, getDayLabel } from "./utils";

interface Props {
  order: Order;
}

const ITEMS_PER_PAGE = 10;

export const OrderHistory = ({ order }: Props) => {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<HistoryFilter>("all");

  const history = useMemo(
    () =>
      [...(order.history || [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [order.history],
  );

  const counts = useMemo(() => {
    const result: Record<HistoryFilter, number> = {
      all: history.length,
      changes: 0,
      status: 0,
      payments: 0,
    };
    history.forEach((item) => {
      const group = actionFilterMap[item.action];
      if (group) result[group] += 1;
    });
    return result;
  }, [history]);

  const filtered = useMemo(
    () =>
      filter === "all" ? history : history.filter((i) => actionFilterMap[i.action] === filter),
    [history, filter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const groups = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const page = filtered.slice(start, start + ITEMS_PER_PAGE);
    const result: { key: string; label: string; items: OrderHistoryEntry[] }[] = [];

    page.forEach((item) => {
      const key = getDayKey(item.createdAt);
      const last = result[result.length - 1];
      if (last && last.key === key) last.items.push(item);
      else result.push({ key, label: getDayLabel(item.createdAt), items: [item] });
    });

    return result;
  }, [filtered, currentPage]);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-4 py-10 text-center dark:border-white/20">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground dark:bg-white/10">
          <HistoryIcon className="h-6 w-6" />
        </div>
        <div>
          <p className="font-medium">История пуста</p>
          <p className="text-sm text-muted-foreground">Изменения заявки появятся здесь</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {historyFilters.map(({ value, label }) => {
          const active = filter === value;
          const count = counts[value];
          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              disabled={value !== "all" && count === 0}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors disabled:pointer-events-none disabled:opacity-40 dark:border-white/20",
                active
                  ? "border-transparent bg-blue-600 text-white dark:bg-blue-600/60"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-white/10",
              )}
            >
              {label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs",
                  active ? "bg-white/20" : "bg-muted dark:bg-white/10",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <section key={group.key} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </span>
              <span className="h-px flex-1 bg-border dark:bg-white/15" />
            </div>
            <ol>
              {group.items.map((item, index) => (
                <HistoryItem key={item.id} item={item} isLast={index === group.items.length - 1} />
              ))}
            </ol>
          </section>
        ))}
      </div>

      {totalPages > 1 && (
        <ListPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          compact={isMobile}
        />
      )}
    </div>
  );
};
