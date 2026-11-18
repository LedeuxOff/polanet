import { Breadcrumbs } from "@/components/breadcrumbs";
import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatPhoneDisplay } from "@/lib/utils/phone";
import { MailIcon, PhoneIcon, SendIcon } from "lucide-react";
import { getUserFullName, RoleBadge, UserAvatar, usersCardClass } from "../../../ui/user-identity";

interface Props {
  user: User;
  /** Раздел в хлебных крошках */
  section?: { label: string; href: "/users" | "/developers" };
}

const Chip = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <span className="flex min-w-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0 [&>svg]:text-slate-400">
    {icon}
    <span className="truncate">{children}</span>
  </span>
);

export const UserPageHead = ({
  user,
  section = { label: "Сотрудники", href: "/users" },
}: Props) => {
  const phone = formatPhoneDisplay(user.phone || undefined);

  return (
    <div className={cn(usersCardClass, "flex flex-col gap-5 p-5 sm:p-6")}>
      <Breadcrumbs
        items={[
          { label: section.label, active: false, href: section.href },
          { label: `${user.firstName} ${user.lastName}`, active: true },
        ]}
      />

      <div className="flex items-center gap-4">
        <UserAvatar user={user} size="lg" />
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
            {getUserFullName(user)}
          </h1>
          <div className="hidden flex-wrap items-center gap-2 sm:flex">
            <RoleBadge roleId={user.roleId} roleName={user.roleName} />
            {user.email && <Chip icon={<MailIcon />}>{user.email}</Chip>}
            {phone && <Chip icon={<PhoneIcon />}>{phone}</Chip>}
            {user.telegramChatId && <Chip icon={<SendIcon />}>Telegram привязан</Chip>}
          </div>
        </div>
      </div>
    </div>
  );
};
