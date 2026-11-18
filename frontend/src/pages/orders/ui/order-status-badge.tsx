import { cn } from "@/lib/utils";
import { statusLabels } from "../list/consts";

export const orderStatusStyles: Record<string, { badge: string; dot: string }> = {
  draft: {
    badge: "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-100",
    dot: "bg-zinc-400",
  },
  new: { badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200", dot: "bg-sky-500" },
  in_progress: {
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
    dot: "bg-blue-500 animate-pulse",
  },
  completed: {
    badge: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200",
    dot: "bg-green-500",
  },
  cancelled: {
    badge: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200",
    dot: "bg-red-500",
  },
  archived: {
    badge: "bg-stone-100 text-stone-600 dark:bg-white/10 dark:text-stone-200",
    dot: "bg-stone-400",
  },
};

export const OrderStatusBadge = ({ status }: { status: string }) => {
  const styles = orderStatusStyles[status] ?? orderStatusStyles.draft;
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        styles.badge,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
      {statusLabels[status] || status}
    </span>
  );
};
