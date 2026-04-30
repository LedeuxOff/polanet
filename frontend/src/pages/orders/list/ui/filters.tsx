import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrdersFilters } from "../hooks";
import { statusLabels } from "../consts";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="filters" className="border-0">
        <AccordionTrigger className="text-base text-[24px] p-0">Фильтры</AccordionTrigger>
        <AccordionContent className="pt-8">
          <div className="flex gap-2 items-end">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 flex-1">
              {/* Поиск по номеру */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Поиск по №</label>
                <Input
                  type="number"
                  placeholder="Введите номер"
                  value={filters.id}
                  onChange={(e) => updateFilter("id", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                />
              </div>

              {/* Фильтр по статусу */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Статус</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => updateFilter("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Фильтр по долгу клиента */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Долг клиента</label>
                <Select
                  value={filters.customerDebt}
                  onValueChange={(value) => updateFilter("customerDebt", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="has">Есть долг</SelectItem>
                    <SelectItem value="none">Нет долга</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Фильтр по долгу компании */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Долг компании</label>
                <Select
                  value={filters.companyDebt}
                  onValueChange={(value) => updateFilter("companyDebt", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="has">Есть долг</SelectItem>
                    <SelectItem value="none">Нет долга</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Фильтр по дате от */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Дата от</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter("dateFrom", e.target.value)}
                />
              </div>

              {/* Фильтр по дату */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Дата до</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter("dateTo", e.target.value)}
                />
              </div>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex justify-center items-center py-5 bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 border-0"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
