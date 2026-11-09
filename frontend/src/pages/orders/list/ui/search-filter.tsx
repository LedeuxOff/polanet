import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { OrdersFilters } from "../hooks";

interface Props {
  id: string;
  updateFilter: <K extends keyof OrdersFilters>(key: K, value: OrdersFilters[K]) => void;
}

export const OrdersListSearchFilter = ({ id, updateFilter }: Props) => {
  return (
    <div className="relative flex-1">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white z-10" />
      <Input
        type="number"
        placeholder="Поиск по номеру заявки"
        className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20 pl-9"
        value={id}
        onChange={(e) => updateFilter("id", e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
    </div>
  );
};
