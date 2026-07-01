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
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="number"
        placeholder="Поиск по номеру заявки"
        className="pl-9 rounded-xl"
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
