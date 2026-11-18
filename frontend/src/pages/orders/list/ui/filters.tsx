import { OrdersFilters } from "../hooks";
import { FilterXIcon, SlidersHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks";
import { cn } from "@/lib/utils";
import { OrdersListSearchFilter } from "./search-filter";
import { OrdersListStatusFilter } from "./status-filter";
import { OrdersListDateFilter } from "./date-filter";

interface Props {
  filters: OrdersFilters;
  updateFilter: <K extends keyof OrdersFilters>(key: K, value: OrdersFilters[K]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

export const OrdersListFilters = ({
  filters,
  updateFilter,
  hasActiveFilters,
  clearFilters,
}: Props) => {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);

  const extraCount =
    Number(filters.status !== "all") + Number(!!filters.dateFrom) + Number(!!filters.dateTo);

  const clearButton = hasActiveFilters && (
    <button
      type="button"
      onClick={clearFilters}
      title="Сбросить фильтры"
      aria-label="Сбросить фильтры"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/20 dark:text-red-200 dark:hover:bg-red-500/30"
    >
      <FilterXIcon className="h-4 w-4" />
    </button>
  );

  const statusFilter = (
    <OrdersListStatusFilter status={filters.status} updateFilter={updateFilter} />
  );
  const dateFrom = (
    <OrdersListDateFilter name="dateFrom" date={filters.dateFrom} updateFilter={updateFilter} />
  );
  const dateTo = (
    <OrdersListDateFilter name="dateTo" date={filters.dateTo} updateFilter={updateFilter} />
  );

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <OrdersListSearchFilter id={filters.id} updateFilter={updateFilter} />
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label="Фильтры"
            className={cn(
              "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors",
              expanded
                ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                : "border-slate-200 bg-white text-slate-600 dark:border-white/20 dark:bg-white/10 dark:text-slate-100",
            )}
          >
            <SlidersHorizontalIcon className="h-4 w-4" />
            {extraCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[11px] font-semibold text-white ring-2 ring-zinc-100 dark:ring-transparent">
                {extraCount}
              </span>
            )}
          </button>
          {clearButton}
        </div>

        {/* Раскрывающаяся панель доп. фильтров */}
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 gap-2 pt-1 [&_button]:w-full">
              <div className="col-span-2">{statusFilter}</div>
              <div>{dateFrom}</div>
              <div>{dateTo}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <OrdersListSearchFilter id={filters.id} updateFilter={updateFilter} />
      {statusFilter}
      {dateFrom}
      {dateTo}
      {clearButton}
    </div>
  );
};
