import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

export const DataTableSearchFilter = ({
  search,
  handleSearchChange,
}: {
  search: string;
  handleSearchChange: (value: string) => void;
}) => {
  return (
    <div className="relative flex-1">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10 dark:text-white" />
      <Input
        type="text"
        placeholder="Поиск по ФИО, email или телефону..."
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="pl-9 rounded-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
      />
    </div>
  );
};
