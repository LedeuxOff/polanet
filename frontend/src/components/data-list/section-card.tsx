import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { listCardClass } from "./styles";

/** Карточка-секция страницы: иконка, заголовок, подпись и контент */
export const SectionCard = ({
  icon,
  iconClassName,
  title,
  description,
  action,
  children,
  className,
}: {
  icon?: ReactNode;
  iconClassName?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section className={cn(listCardClass, "flex flex-col gap-5 p-5 sm:p-6", className)}>
    <header className="flex items-center gap-3">
      {icon && (
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200 [&>svg]:h-5 [&>svg]:w-5",
            iconClassName,
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        {description && (
          <span className="text-sm text-slate-500 dark:text-slate-300">{description}</span>
        )}
      </div>
      {action}
    </header>
    {children}
  </section>
);
