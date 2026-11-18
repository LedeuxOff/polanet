import { cn } from "@/lib/utils";

/** Базовая кнопка таббара */
const base =
  "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-medium transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [&>svg]:h-5 [&>svg]:w-5";

export const barButton = {
  /** Основное действие: Сохранить / Создать */
  primary: cn(
    base,
    "flex-1 bg-blue-600 px-6 sm:min-w-[160px] sm:flex-none text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 dark:bg-blue-500/80 dark:shadow-none dark:hover:bg-blue-500",
  ),
  /** Второстепенное: назад, меню, скрыть */
  secondary: cn(
    base,
    "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/20",
  ),
  /** Опасное: удалить */
  danger: cn(
    base,
    "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-200 dark:hover:bg-red-500/30",
  ),
  /** Квадратная иконка */
  icon: "w-12 px-0",
};
