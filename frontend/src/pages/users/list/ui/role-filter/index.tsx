import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Role } from "@/lib/types";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

interface Props {
  roleCode: string;
  roles: Role[];
  handleRoleChange: (value: string) => void;
}

export const UsersPageRoleFilter = ({ roleCode, roles, handleRoleChange }: Props) => {
  const [showRolePopover, setShowRolePopover] = useState(false);

  const getRoleFilterLabel = (): string => {
    if (roleCode === "all") return "Все роли";
    const role = roles.find((r) => r.id.toString() === roleCode);
    return role?.name || "Все роли";
  };

  return (
    <Popover.Root open={showRolePopover} onOpenChange={setShowRolePopover}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          className="rounded-xl flex items-center gap-2 dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
        >
          <span className="truncate">{getRoleFilterLabel()}</span>
          <ChevronDownIcon className="h-4 w-4 ml-auto shrink-0" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-64 rounded-2xl shadow-xl bg-white border border-gray-200 p-2 dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
          sideOffset={5}
          align="end"
        >
          <div className="flex flex-col">
            {/* Все роли */}
            <button
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                roleCode === "all"
                  ? "bg-blue-50 text-blue-600 dark:text-zinc-100 font-medium dark:bg-white/10 dark:border-white/20"
                  : "hover:bg-gray-100 text-gray-700 dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:border-white/20"
              }`}
              onClick={() => {
                handleRoleChange("all");
                setShowRolePopover(false);
              }}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  roleCode === "all"
                    ? "border-blue-600 bg-blue-600 dark:border-slate-300 dark:bg-slate-300"
                    : "border-gray-300"
                }`}
              >
                {roleCode === "all" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-zinc-400" />
                )}
              </span>
              Все роли
            </button>

            {/* Разделитель */}
            <Separator className="my-2 dark:bg-slate-50/20" />

            {/* Роли */}
            <div className="flex flex-col gap-2">
              {roles
                .filter((role) => role.code !== "DEVELOPER")
                .map((role) => (
                  <button
                    key={role.id}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      roleCode === role.id.toString()
                        ? "bg-blue-50 text-blue-600 dark:text-zinc-100 font-medium dark:bg-white/10 dark:border-white/20"
                        : "hover:bg-gray-100 text-gray-700 dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:border-white/20"
                    }`}
                    onClick={() => {
                      handleRoleChange(role.id.toString());
                      setShowRolePopover(false);
                    }}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        roleCode === role.id.toString()
                          ? "border-blue-600 bg-blue-600 dark:border-slate-300 dark:bg-slate-300"
                          : "border-gray-300"
                      }`}
                    >
                      {roleCode === role.id.toString() && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-zinc-400" />
                      )}
                    </span>
                    {role.name}
                  </button>
                ))}
            </div>
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
