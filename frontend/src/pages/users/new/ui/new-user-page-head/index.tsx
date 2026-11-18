import { Breadcrumbs } from "@/components/breadcrumbs";
import { cn } from "@/lib/utils";
import { UserPlusIcon } from "lucide-react";
import { usersCardClass } from "../../../ui/user-identity";

export const NewUserPageHead = () => (
  <div className={cn(usersCardClass, "flex flex-col gap-5 p-5 sm:p-6")}>
    <Breadcrumbs
      items={[
        { label: "Сотрудники", active: false, href: "/users" },
        { label: "Создание сотрудника", active: true },
      ]}
    />
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300">
        <UserPlusIcon className="h-6 w-6" />
      </div>
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
          Новый сотрудник
        </h1>
        <span className="text-sm text-slate-500 dark:text-slate-300">
          Заполните данные и выберите роль
        </span>
      </div>
    </div>
  </div>
);
