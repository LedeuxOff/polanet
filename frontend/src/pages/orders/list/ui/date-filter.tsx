import { ChevronDownIcon } from "lucide-react";
import { OrdersFilters } from "../hooks";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  name: keyof OrdersFilters;
  date: string;
  updateFilter: <K extends keyof OrdersFilters>(key: K, value: OrdersFilters[K]) => void;
}

const DATE_FILTER_LABELS: Record<string, string> = {
  dateFrom: "Дата от",
  dateTo: "Дата до",
};

export const OrdersListDateFilter = ({ name, date, updateFilter }: Props) => {
  const [showDatePopover, setShowDatePopover] = useState(false);

  const getDateFilterLabel = (): string => {
    if (!date) return DATE_FILTER_LABELS[name] || "Дата";

    const dateParts = date.split("-");

    return `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
  };

  const [currentMonth, setCurrentMonth] = useState(date ? new Date(date) : new Date());
  const [selected, setSelected] = useState<Date | null>(date ? new Date(date) : null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Получаем первый день месяца
  const firstDay = new Date(year, month, 1);
  // Получаем последний день месяца
  const lastDay = new Date(year, month + 1, 0);
  // День недели первого дня (0=Вс, 1=Пн, ..., 6=Сб)
  let startDay = firstDay.getDay();
  // Корректируем: Пн=0, ..., Вс=6
  startDay = startDay === 0 ? 6 : startDay - 1;

  // Генерируем дни для календаря
  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  // Дни предыдущего месяца
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month, -i),
      isCurrentMonth: false,
    });
  }

  // Дни текущего месяца
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({
      date: new Date(year, month, d),
      isCurrentMonth: true,
    });
  }

  // Дни следующего месяца
  const remaining = 42 - days.length; // 6 недель * 7 дней
  for (let d = 1; d <= remaining; d++) {
    days.push({
      date: new Date(year, month + 1, d),
      isCurrentMonth: false,
    });
  }

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(year, month + offset, 1));
  };

  const handleSelect = (dayDate: Date) => {
    // Используем локальную дату, чтобы не было сдвига из-за timezone
    const year = dayDate.getFullYear();
    const month = String(dayDate.getMonth() + 1).padStart(2, "0");
    const day = String(dayDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    setSelected(dayDate);
    updateFilter(name, dateStr as OrdersFilters[keyof OrdersFilters]);
    setShowDatePopover(false);
  };

  const isToday = (dayDate: Date) => {
    const today = new Date();
    return (
      dayDate.getDate() === today.getDate() &&
      dayDate.getMonth() === today.getMonth() &&
      dayDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (dayDate: Date) => {
    if (!selected) return false;
    return (
      dayDate.getDate() === selected.getDate() &&
      dayDate.getMonth() === selected.getMonth() &&
      dayDate.getFullYear() === selected.getFullYear()
    );
  };

  const clearDate = () => {
    setSelected(null);
    updateFilter(name, "" as OrdersFilters[keyof OrdersFilters]);
    setShowDatePopover(false);
  };

  const monthName = currentMonth.toLocaleString("ru-RU", { month: "long", year: "numeric" });

  return (
    <Popover open={showDatePopover} onOpenChange={setShowDatePopover}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="rounded-xl flex items-center gap-2 min-w-[180px]">
          <span className="truncate">{getDateFilterLabel()}</span>
          <ChevronDownIcon className="h-4 w-4 ml-auto shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="z-50 w-64 rounded-2xl bg-white border border-gray-200 shadow-lg p-1"
        sideOffset={5}
        align="end"
      >
        <div className="space-y-4 p-2">
          <div className="flex items-center justify-between px-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeMonth(-1)}
              className="rounded-2xl"
            >
              ←
            </Button>
            <span className="capitalize text-sm font-medium">{monthName}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeMonth(1)}
              className="rounded-2xl"
            >
              →
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                {day}
              </div>
            ))}
            {days.map((day, index) => {
              const today = isToday(day.date);
              const selectedDay = isSelected(day.date);
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 text-sm rounded-2xl",
                    !day.isCurrentMonth && "text-muted-foreground opacity-50",
                    today && "bg-accent font-medium",
                    selectedDay &&
                      "bg-blue-500 text-primary-foreground hover:bg-blue-500 hover:text-primary-foreground",
                  )}
                  onClick={() => handleSelect(day.date)}
                >
                  {day.date.getDate()}
                </Button>
              );
            })}
          </div>

          {date && (
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-2xl bg-red-400/40 hover:bg-red-400/60 text-red-500 hover:text-red-500 border-none"
              onClick={clearDate}
            >
              Сбросить
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
