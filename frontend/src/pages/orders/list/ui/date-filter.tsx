import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { calendarPopoverClass, CalendarPanel, formatDateValue } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { OrdersFilters } from "../hooks";

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
  const [open, setOpen] = useState(false);

  const setValue = (value: string) => {
    updateFilter(name, value as OrdersFilters[keyof OrdersFilters]);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-11 rounded-2xl border-slate-200 bg-white px-4 flex items-center gap-2 sm:min-w-[180px] dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
          <span className={cn("truncate tabular-nums", !date && "text-muted-foreground")}>
            {date ? formatDateValue(date) : DATE_FILTER_LABELS[name] || "Дата"}
          </span>
          <ChevronDownIcon className="h-4 w-4 ml-auto shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className={calendarPopoverClass} sideOffset={6} align="end">
        <CalendarPanel value={date} onSelect={setValue} onClear={() => setValue("")} />
      </PopoverContent>
    </Popover>
  );
};
