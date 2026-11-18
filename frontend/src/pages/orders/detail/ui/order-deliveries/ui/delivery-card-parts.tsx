import { ReactNode, useState } from "react";
import { DeliveryWithIncome } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, HistoryIcon, MessageSquareIcon } from "lucide-react";
import { deliveryStatusLabels } from "../../../consts";
import { RecipientHistoryList } from "./recipient-history";
import { statusStyles } from "../utils";

export const DeliveryStatusBadge = ({ status }: { status: DeliveryWithIncome["status"] }) => {
  const styles = statusStyles[status] ?? statusStyles.in_progress;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles.badge,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
      {deliveryStatusLabels[status]}
    </span>
  );
};

export const DeliveryDateBlock = ({ dateTime }: { dateTime: string }) => {
  const dt = new Date(dateTime);
  const day = dt.getDate();
  const month = dt.toLocaleString("ru-RU", { month: "short" }).replace(".", "");
  const weekday = dt.toLocaleString("ru-RU", { weekday: "short" });
  const time = dt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex w-[72px] shrink-0 flex-col items-center justify-center rounded-xl bg-muted/60 py-2 dark:bg-white/10">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{weekday}</span>
      <span className="text-2xl font-bold leading-none">{day}</span>
      <span className="text-xs text-muted-foreground">{month}</span>
      <span className="mt-1 rounded-md bg-background px-1.5 text-xs font-medium dark:bg-white/10">
        {time}
      </span>
    </div>
  );
};

interface InfoFieldProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}

export const DeliveryInfoField = ({ icon, label, value, hint }: InfoFieldProps) => (
  <div className="flex min-w-0 items-start gap-2.5">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground dark:bg-white/10 dark:text-zinc-300">
      {icon}
    </div>
    <div className="flex min-w-0 flex-col">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-medium">{value}</span>
      {hint && <span className="truncate text-xs text-muted-foreground">{hint}</span>}
    </div>
  </div>
);

export const DeliveryComment = ({ comment }: { comment: string }) => (
  <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-sm dark:bg-white/5">
    <MessageSquareIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
    <span className="whitespace-pre-wrap break-words text-muted-foreground">{comment}</span>
  </div>
);

export const DeliveryHistoryToggle = ({
  deliveryId,
  refreshKey,
}: {
  deliveryId: number;
  refreshKey?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <HistoryIcon className="h-3.5 w-3.5" />
        История получателей
        <ChevronDownIcon className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && <RecipientHistoryList key={refreshKey} deliveryId={deliveryId} />}
    </div>
  );
};
