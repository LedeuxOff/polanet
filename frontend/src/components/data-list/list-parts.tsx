import { ReactNode } from "react";
import { SearchXIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { listCardClass } from "./styles";

export const Shimmer = ({ className }: { className?: string }) => (
  <span className={cn("block animate-pulse rounded-lg bg-slate-200 dark:bg-white/10", className)} />
);

export const ListEmptyState = ({
  title = "Ничего не нашли",
  text = "Попробуйте изменить поиск или фильтры",
  icon = <SearchXIcon />,
}: {
  title?: string;
  text?: string;
  icon?: ReactNode;
}) => (
  <div
    className={cn(
      listCardClass,
      "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center",
    )}
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-300 [&>svg]:h-6 [&>svg]:w-6">
      {icon}
    </div>
    <div className="flex flex-col gap-1">
      <span className="font-medium text-slate-900 dark:text-slate-100">{title}</span>
      <span className="text-sm text-slate-500 dark:text-slate-400">{text}</span>
    </div>
  </div>
);

/** Шапка страницы списка: иконка, заголовок, подпись */
export const ListPageHead = ({
  icon,
  iconClassName,
  title,
  description,
}: {
  icon: ReactNode;
  iconClassName?: string;
  title: string;
  description?: string;
}) => (
  <div className={cn(listCardClass, "flex items-center gap-4 p-5 sm:p-6")}>
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300 [&>svg]:h-6 [&>svg]:w-6",
        iconClassName,
      )}
    >
      {icon}
    </div>
    <div className="flex flex-col gap-0.5">
      <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
        {title}
      </h1>
      {description && (
        <span className="text-sm text-slate-500 dark:text-slate-300">{description}</span>
      )}
    </div>
  </div>
);

/** Плашка-чип для шапки деталки */
export const HeadChip = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <span className="flex min-w-0 max-w-full items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0 [&>svg]:text-slate-400">
    {icon}
    <span className="truncate">{children}</span>
  </span>
);

/** Шапка деталки/создания: хлебные крошки, иконка, заголовок, бейджи и чипы (чипы — только десктоп) */
export const DetailPageHead = ({
  breadcrumbs,
  icon,
  iconClassName,
  title,
  badges,
  chips,
}: {
  breadcrumbs: ReactNode;
  icon: ReactNode;
  iconClassName?: string;
  title: ReactNode;
  badges?: ReactNode;
  chips?: ReactNode;
}) => (
  <div className={cn(listCardClass, "flex flex-col gap-5 p-5 sm:p-6")}>
    {breadcrumbs}
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200 [&>svg]:h-7 [&>svg]:w-7",
          iconClassName,
        )}
      >
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
            {title}
          </h1>
          {badges}
        </div>
        {chips && <div className="hidden flex-wrap items-center gap-2 sm:flex">{chips}</div>}
      </div>
    </div>
  </div>
);
