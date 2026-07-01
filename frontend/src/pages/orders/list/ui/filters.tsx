import { OrdersFilters } from "../hooks";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
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
  return (
    <div className="flex gap-2 items-end">
      <div className="flex gap-2 w-full">
        {/* Поиск по номеру */}
        <OrdersListSearchFilter id={filters.id} updateFilter={updateFilter} />

        {/* Фильтр по статусу */}
        <OrdersListStatusFilter status={filters.status} updateFilter={updateFilter} />

        {/* Фильтр по дате от */}
        <OrdersListDateFilter name="dateFrom" date={filters.dateFrom} updateFilter={updateFilter} />

        {/* Фильтр по дату до */}
        <OrdersListDateFilter name="dateTo" date={filters.dateTo} updateFilter={updateFilter} />
      </div>
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="flex justify-center items-center py-5 bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 border-0 rounded-2xl"
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
