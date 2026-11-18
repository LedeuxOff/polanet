import { CreditCardIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Номер карты группами по 4 символа */
export const formatCardNumber = (value?: string | null) =>
  (value ?? "").replace(/\s+/g, "").replace(/(.{4})(?=.)/g, "$1 ");

export const CardStatusBadge = ({ status }: { status?: string | null }) => {
  const active = status === "active";
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        active
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200"
          : "bg-red-100 text-red-700 dark:bg-red-400/20 dark:text-red-200",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {active ? "Активна" : "Неактивна"}
    </span>
  );
};

export const FuelCardIcon = ({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) => (
  <div
    className={cn(
      "flex shrink-0 items-center justify-center [&>svg]:h-1/2 [&>svg]:w-1/2",
      status === "active"
        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300"
        : "bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-400",
      className,
    )}
  >
    <CreditCardIcon />
  </div>
);
