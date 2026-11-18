import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface DataTableColumnSettingProps {
  columnDefinitions: {
    key: string;
    label: string;
  }[];
  columnVisibility: Record<string, boolean>;
  handleColumnToggle: (key: string) => void;
  triggerClassName?: string;
}

export const DataTableColumnSetting = ({
  columnDefinitions,
  columnVisibility,
  handleColumnToggle,
  triggerClassName,
}: DataTableColumnSettingProps) => {
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={showColumnSettings} onOpenChange={setShowColumnSettings}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "rounded-xl w-10 h-10 p-0 dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20 dark:hover:bg-white/20",
              triggerClassName,
            )}
          >
            <Settings className="h-4 w-4 dark:text-white" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
          <div className="px-4 py-4">
            <h3 className="text-lg font-semibold mb-4">Столбцы таблицы</h3>
            <div className="space-y-3">
              {columnDefinitions.map((col) => (
                <div key={col.key} className="flex items-center gap-3">
                  <Checkbox
                    id={`column-${col.key}`}
                    checked={columnVisibility[col.key] || false}
                    onCheckedChange={() => handleColumnToggle(col.key)}
                  />
                  <label
                    htmlFor={`column-${col.key}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {col.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover.Root open={showColumnSettings} onOpenChange={setShowColumnSettings}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          className={cn(
            "rounded-2xl w-10 h-10 p-0 dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20 dark:hover:bg-white/20",
            triggerClassName,
          )}
        >
          <Settings className="h-4 w-4 dark:text-white" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-56 rounded-xl bg-white border border-gray-200 dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20 shadow-xl p-4 [&>span]:hidden"
          sideOffset={5}
          align="start"
        >
          <h3 className="text-sm font-semibold mb-3">Столбцы таблицы</h3>
          <div className="space-y-2">
            {columnDefinitions.map((col) => (
              <div key={col.key} className="flex items-center gap-3">
                <Checkbox
                  id={`column-${col.key}`}
                  checked={columnVisibility[col.key] || false}
                  onCheckedChange={() => handleColumnToggle(col.key)}
                />
                <label htmlFor={`column-${col.key}`} className="text-sm cursor-pointer">
                  {col.label}
                </label>
              </div>
            ))}
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
