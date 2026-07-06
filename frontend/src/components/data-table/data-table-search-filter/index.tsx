import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

export const DataTableSearchFilter = ({
  search,
  handleSearchChange,
  placeholder = "Поиск...",
}: {
  search: string;
  handleSearchChange: (value: string) => void;
  placeholder?: string;
}) => {
  return (
    <div className="relative flex-1">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10 dark:text-white" />
      <Input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="pl-9 rounded-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
      />
    </div>
  );
};
