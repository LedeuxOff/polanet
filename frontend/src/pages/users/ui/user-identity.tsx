import { cn } from "@/lib/utils";
import { User } from "@/lib/types";

/** Палитра тонов для ролей — цвет стабильно привязан к id роли */
const ROLE_TONES = [
  "bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-blue-200",
  "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200",
  "bg-violet-100 text-violet-700 dark:bg-violet-400/20 dark:text-violet-200",
  "bg-rose-100 text-rose-700 dark:bg-rose-400/20 dark:text-rose-200",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-400/20 dark:text-cyan-200",
  "bg-orange-100 text-orange-700 dark:bg-orange-400/20 dark:text-orange-200",
] as const;

export const getRoleTone = (roleId?: number | null) =>
  ROLE_TONES[Math.abs(roleId ?? 0) % ROLE_TONES.length];

export const getUserInitials = (user: Pick<User, "firstName" | "lastName">) =>
  `${user.lastName?.[0] ?? ""}${user.firstName?.[0] ?? ""}`.toUpperCase() || "?";

export const getUserShortName = (user: Pick<User, "firstName" | "lastName" | "middleName">) => {
  const initials = [user.firstName?.charAt(0), user.middleName?.charAt(0)]
    .filter(Boolean)
    .join(".");
  return initials ? `${user.lastName} ${initials}.` : user.lastName;
};

export const getUserFullName = (user: Pick<User, "firstName" | "lastName" | "middleName">) =>
  [user.lastName, user.firstName, user.middleName].filter(Boolean).join(" ");

const avatarSizes = {
  sm: "h-9 w-9 rounded-xl text-xs",
  md: "h-11 w-11 rounded-2xl text-sm",
  lg: "h-16 w-16 rounded-[20px] text-xl",
} as const;

export const UserAvatar = ({
  user,
  size = "md",
  className,
}: {
  user: Pick<User, "firstName" | "lastName" | "roleId">;
  size?: keyof typeof avatarSizes;
  className?: string;
}) => (
  <div
    className={cn(
      "flex shrink-0 items-center justify-center font-semibold",
      avatarSizes[size],
      getRoleTone(user.roleId),
      className,
    )}
  >
    {getUserInitials(user)}
  </div>
);

export const RoleBadge = ({
  roleId,
  roleName,
  className,
}: {
  roleId?: number | null;
  roleName?: string | null;
  className?: string;
}) => {
  if (!roleName) return <span className="text-slate-400">—</span>;
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        getRoleTone(roleId),
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {roleName}
    </span>
  );
};

/** Общие классы карточек раздела */
export { listCardClass as usersCardClass } from "@/components/data-list/styles";
