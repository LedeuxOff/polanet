import { ChevronDownIcon } from "lucide-react";
import { OrdersFilters } from "../hooks";
import { useState } from "react";
import { statusLabels } from "../consts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface Props {
  status: string;
  updateFilter: <K extends keyof OrdersFilters>(key: K, value: OrdersFilters[K]) => void;
}

export const OrdersListStatusFilter = ({ status, updateFilter }: Props) => {
  const [showStatusPopover, setShowStatusPopover] = useState(false);

  const getStatusFilterLabel = (): string => {
    if (status === "all") return "Все статусы";

    return statusLabels[status];
  };

  return (
    <Popover open={showStatusPopover} onOpenChange={setShowStatusPopover}>
      <PopoverTrigger>
        <Button variant="outline" className="rounded-xl flex items-center gap-2 min-w-[180px]">
          <span className="truncate">{getStatusFilterLabel()}</span>
          <ChevronDownIcon className="h-4 w-4 ml-auto shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="z-50 w-64 rounded-xl bg-white border border-gray-200 shadow-lg p-1"
        sideOffset={5}
        align="end"
      >
        <div className="flex flex-col">
          {/* Все роли */}
          <button
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              status === "all"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            onClick={() => {
              updateFilter("status", "all");
              setShowStatusPopover(false);
            }}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                status === "all" ? "border-blue-600 bg-blue-600" : "border-gray-300"
              }`}
            >
              {status === "all" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
            Все статусы
          </button>

          {/* Разделитель */}
          <div className="my-1 h-px bg-gray-100" />

          {Object.entries(statusLabels).map(([key, label]) => (
            <button
              key={key}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                status === key
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
              onClick={() => {
                updateFilter("status", key);
                setShowStatusPopover(false);
              }}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  status === key ? "border-blue-600 bg-blue-600" : "border-gray-300"
                }`}
              >
                {status === key && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              {label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
