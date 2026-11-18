import { ChevronRightIcon } from "lucide-react";
import { useIsMobile } from "@/hooks";
import { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  listCardClass,
  ListEmptyState,
  listTdClass as td,
  listThClass as th,
  Shimmer,
} from "@/components/data-list";
import { RoleCodeBadge, RoleIcon } from "../../ui/role-parts";

interface Props {
  roles: Role[];
  isLoading: boolean;
  onOpen: (role: Role) => void;
}

export const RolesTable = ({ roles, isLoading, onOpen }: Props) => {
  const isMobile = useIsMobile();

  if (!isLoading && !roles.length)
    return <ListEmptyState title="Ролей пока нет" text="Создайте первую роль" />;

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={cn(listCardClass, "flex items-center gap-3 p-4")}>
                <Shimmer className="h-11 w-11 rounded-2xl" />
                <div className="flex flex-1 flex-col gap-2">
                  <Shimmer className="h-4 w-1/2" />
                  <Shimmer className="h-4 w-20" />
                </div>
              </div>
            ))
          : roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => onOpen(role)}
                className={cn(
                  listCardClass,
                  "flex items-center gap-3 p-4 text-left transition-all active:scale-[0.99] hover:border-slate-300 dark:hover:bg-white/15",
                )}
              >
                <RoleIcon className="h-11 w-11 rounded-2xl" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
                    {role.name}
                  </span>
                  <RoleCodeBadge code={role.code} />
                </div>
                <ChevronRightIcon className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-500" />
              </button>
            ))}
      </div>
    );
  }

  return (
    <div className={cn(listCardClass, "overflow-hidden")}>
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-white/15 dark:bg-white/5">
          <tr>
            <th className={th}>Роль</th>
            <th className={th}>Код</th>
            <th className="w-12" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/10">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <Shimmer className="h-9 w-9 rounded-xl" />
                      <Shimmer className="h-4 w-40" />
                    </div>
                  </td>
                  <td className={td}>
                    <Shimmer className="h-5 w-24" />
                  </td>
                  <td />
                </tr>
              ))
            : roles.map((role) => (
                <tr
                  key={role.id}
                  onClick={() => onOpen(role)}
                  className="group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/10"
                >
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <RoleIcon className="h-9 w-9 rounded-xl" />
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {role.name}
                      </span>
                    </div>
                  </td>
                  <td className={td}>
                    <RoleCodeBadge code={role.code} />
                  </td>
                  <td className="pr-4 text-right">
                    <ChevronRightIcon className="ml-auto h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-300" />
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
};
