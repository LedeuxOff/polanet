import { ChevronRightIcon, MailIcon, PhoneIcon, SearchXIcon } from "lucide-react";
import { useIsMobile } from "@/hooks";
import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatPhoneDisplay } from "@/lib/utils/phone";
import { getUserFullName, RoleBadge, UserAvatar, usersCardClass } from "../../../ui/user-identity";

interface Props {
  users: User[];
  isLoading: boolean;
  columnVisibility: Record<string, boolean>;
  skeletonCount?: number;
  onOpen: (user: User) => void;
}

const formatPhone = (phone: string | null) => formatPhoneDisplay(phone || undefined) || "—";

const EmptyState = () => (
  <div
    className={cn(
      usersCardClass,
      "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center",
    )}
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-300">
      <SearchXIcon className="h-6 w-6" />
    </div>
    <div className="flex flex-col gap-1">
      <span className="font-medium text-slate-900 dark:text-slate-100">Никого не нашли</span>
      <span className="text-sm text-slate-500 dark:text-slate-400">
        Попробуйте изменить поиск или фильтр по роли
      </span>
    </div>
  </div>
);

const Shimmer = ({ className }: { className?: string }) => (
  <span className={cn("block animate-pulse rounded-lg bg-slate-200 dark:bg-white/10", className)} />
);

/* ---------- Мобильная версия: карточки ---------- */

const MobileList = ({
  users,
  isLoading,
  columnVisibility: v,
  skeletonCount = 5,
  onOpen,
}: Props) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className={cn(usersCardClass, "flex items-center gap-3 p-4")}>
            <Shimmer className="h-11 w-11 rounded-2xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Shimmer className="h-4 w-2/3" />
              <Shimmer className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!users.length) return <EmptyState />;

  return (
    <div className="flex flex-col gap-3">
      {users.map((user) => (
        <button
          key={user.id}
          type="button"
          onClick={() => onOpen(user)}
          className={cn(
            usersCardClass,
            "flex flex-col gap-3 p-4 text-left transition-all active:scale-[0.99] hover:border-slate-300 dark:hover:bg-white/15",
          )}
        >
          <div className="flex items-center gap-3">
            <UserAvatar user={user} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
                {getUserFullName(user)}
              </span>
              {v.roleName !== false && <RoleBadge roleId={user.roleId} roleName={user.roleName} />}
            </div>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-500" />
          </div>

          {(v.email !== false || v.phone !== false) && (
            <div className="flex flex-col gap-1.5 rounded-2xl bg-slate-50 p-3 text-sm dark:bg-white/5">
              {v.email !== false && (
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <MailIcon className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">{user.email || "—"}</span>
                </span>
              )}
              {v.phone !== false && (
                <span className="flex items-center gap-2 tabular-nums text-slate-600 dark:text-slate-300">
                  <PhoneIcon className="h-4 w-4 shrink-0 text-slate-400" />
                  {formatPhone(user.phone)}
                </span>
              )}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

/* ---------- Десктоп: таблица ---------- */

const th =
  "h-11 px-5 text-left align-middle text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300";
const td = "px-5 py-3.5 align-middle";

const DesktopTable = ({
  users,
  isLoading,
  columnVisibility: v,
  skeletonCount = 5,
  onOpen,
}: Props) => {
  if (!isLoading && !users.length) return <EmptyState />;

  return (
    <div className={cn(usersCardClass, "overflow-hidden")}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-white/15 dark:bg-white/5">
            <tr>
              <th className={th}>Сотрудник</th>
              {v.email !== false && <th className={th}>Email</th>}
              {v.phone !== false && <th className={th}>Телефон</th>}
              {v.roleName !== false && <th className={th}>Роль</th>}
              <th className="w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {isLoading
              ? Array.from({ length: skeletonCount }).map((_, i) => (
                  <tr key={i}>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <Shimmer className="h-9 w-9 rounded-xl" />
                        <Shimmer className="h-4 w-40" />
                      </div>
                    </td>
                    {v.email !== false && (
                      <td className={td}>
                        <Shimmer className="h-4 w-44" />
                      </td>
                    )}
                    {v.phone !== false && (
                      <td className={td}>
                        <Shimmer className="h-4 w-32" />
                      </td>
                    )}
                    {v.roleName !== false && (
                      <td className={td}>
                        <Shimmer className="h-6 w-24 rounded-full" />
                      </td>
                    )}
                    <td />
                  </tr>
                ))
              : users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => onOpen(user)}
                    className="group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/10"
                  >
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} size="sm" />
                        <span className="whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                          {getUserFullName(user)}
                        </span>
                      </div>
                    </td>
                    {v.email !== false && (
                      <td
                        className={cn(td, "whitespace-nowrap text-slate-600 dark:text-slate-300")}
                      >
                        {user.email || "—"}
                      </td>
                    )}
                    {v.phone !== false && (
                      <td
                        className={cn(
                          td,
                          "whitespace-nowrap tabular-nums text-slate-600 dark:text-slate-300",
                        )}
                      >
                        {formatPhone(user.phone)}
                      </td>
                    )}
                    {v.roleName !== false && (
                      <td className={td}>
                        <RoleBadge roleId={user.roleId} roleName={user.roleName} />
                      </td>
                    )}
                    <td className="pr-4 text-right">
                      <ChevronRightIcon className="ml-auto h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-300" />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const UsersTable = (props: Props) => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileList {...props} /> : <DesktopTable {...props} />;
};
