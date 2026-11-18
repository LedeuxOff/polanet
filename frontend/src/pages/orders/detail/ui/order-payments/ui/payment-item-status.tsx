import { cn } from "@/lib/utils";

export const OrderPaymentsIncomeItemStatus = ({ isPaid }: { isPaid: boolean }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
      isPaid
        ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200"
        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-200",
    )}
  >
    <span className={cn("h-1.5 w-1.5 rounded-full", isPaid ? "bg-green-500" : "bg-yellow-500")} />
    {isPaid ? "Оплачен" : "Ожидает"}
  </span>
);
