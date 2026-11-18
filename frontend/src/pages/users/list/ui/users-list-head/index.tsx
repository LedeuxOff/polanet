import { UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usersCardClass } from "../../../ui/user-identity";

export const UsersListPageHead = () => (
  <div className={cn(usersCardClass, "flex items-center gap-4 p-5 sm:p-6")}>
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300">
        <UsersIcon className="h-6 w-6" />
      </div>
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
          Сотрудники
        </h1>
        <span className="text-sm text-slate-500 dark:text-slate-300">Команда, роли и контакты</span>
      </div>
    </div>
  </div>
);
