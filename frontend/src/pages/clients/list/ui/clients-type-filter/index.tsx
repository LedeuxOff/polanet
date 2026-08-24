import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

interface Props {
  clientType: string;
  handleTypeChange: (value: string) => void;
  getTypeFilterLabel: () => string;
}

export const ClientsTypeFilter = ({ clientType, handleTypeChange, getTypeFilterLabel }: Props) => {
  const [showTypePopover, setShowTypePopover] = useState(false);

  return (
    <Popover open={showTypePopover} onOpenChange={setShowTypePopover}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="rounded-xl flex items-center gap-2 min-w-[180px] dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
        >
          {getTypeFilterLabel()}
          <ChevronDownIcon className="h-4 w-4 ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[180px] p-2 rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
        align="end"
      >
        <div className="flex flex-col gap-1">
          {[
            { value: "all", label: "Все" },
            { value: "individual", label: "Физ. лицо" },
            { value: "legal", label: "Юр. лицо" },
          ].map((option) => (
            <Button
              key={option.value}
              variant={clientType === option.value ? "secondary" : "ghost"}
              className={`justify-start dark:hover:bg-white/10 ${clientType === option.value ? "font-medium dark:bg-white/10" : ""}`}
              onClick={() => {
                handleTypeChange(option.value);
                setShowTypePopover(false);
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
