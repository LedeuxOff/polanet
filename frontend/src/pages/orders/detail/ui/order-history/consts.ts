export type HistoryFilter = "all" | "changes" | "status" | "payments";

export const historyFilters: { value: HistoryFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "changes", label: "Изменения" },
  { value: "status", label: "Статусы" },
  { value: "payments", label: "Выплаты" },
];

export const actionFilterMap: Record<string, HistoryFilter> = {
  created: "changes",
  updated: "changes",
  deleted: "changes",
  status_changed: "status",
  payment_added: "payments",
  payment_removed: "payments",
};

export const actionMeta: Record<string, { label: string; className: string }> = {
  created: {
    label: "Заявка создана",
    className: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200",
  },
  updated: {
    label: "Изменение",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
  },
  status_changed: {
    label: "Смена статуса",
    className: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200",
  },
  payment_added: {
    label: "Выплата добавлена",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  },
  payment_removed: {
    label: "Выплата удалена",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200",
  },
  deleted: {
    label: "Удалена",
    className: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200",
  },
};

export const fallbackActionClass =
  "bg-muted text-muted-foreground dark:bg-white/10 dark:text-zinc-300";
