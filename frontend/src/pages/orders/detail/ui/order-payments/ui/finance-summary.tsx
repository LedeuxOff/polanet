import { cn, getFormattedAmount } from "@/lib/utils";
import { AlertCircleIcon, CheckCircle2Icon, ClockIcon } from "lucide-react";

interface Props {
  receivedAmount: number;
  pendingAmount: number;
  customerDebt: number;
  companyDebt: number;
  isMobile: boolean;
}

const tiles = [
  {
    key: "pending",
    label: "Ожидает подтверждения",
    color: "text-yellow-600 dark:text-yellow-400",
    dot: "bg-yellow-500",
  },
  {
    key: "customerDebt",
    label: "Долг клиента",
    color: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
  },
  {
    key: "companyDebt",
    label: "Долг компании",
    color: "text-orange-600 dark:text-orange-400",
    dot: "bg-orange-500",
  },
] as const;

export const FinanceSummary = ({
  receivedAmount,
  pendingAmount,
  customerDebt,
  companyDebt,
  isMobile,
}: Props) => {
  const values = { pending: pendingAmount, customerDebt, companyDebt };
  const total = receivedAmount + pendingAmount + customerDebt;
  const pct = (v: number) => (total > 0 ? (v / total) * 100 : 0);
  const settled = customerDebt <= 0 && companyDebt <= 0 && pendingAmount <= 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-2xl border p-4 dark:border-white/20">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm text-muted-foreground">Получено средств</p>
            <p className="text-3xl font-bold tabular-nums text-green-600 dark:text-green-400">
              {getFormattedAmount(receivedAmount)} ₽
            </p>
          </div>
          {settled ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-500/20 dark:text-green-200">
              <CheckCircle2Icon className="h-4 w-4" /> Расчёты завершены
            </span>
          ) : customerDebt > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-500/20 dark:text-red-200">
              <AlertCircleIcon className="h-4 w-4" /> Есть задолженность
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-200">
              <ClockIcon className="h-4 w-4" /> Ожидают подтверждения
            </span>
          )}
        </div>

        {total > 0 && (
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted dark:bg-white/10">
            <div className="h-full bg-green-500" style={{ width: `${pct(receivedAmount)}%` }} />
            <div className="h-full bg-yellow-500" style={{ width: `${pct(pendingAmount)}%` }} />
            <div className="h-full bg-red-500" style={{ width: `${pct(customerDebt)}%` }} />
          </div>
        )}
      </div>

      <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-3")}>
        {tiles.map((tile) => {
          const value = values[tile.key];
          return (
            <div
              key={tile.key}
              className={cn(
                "rounded-2xl border p-3 dark:border-white/20",
                isMobile && "flex items-center justify-between",
              )}
            >
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn("h-1.5 w-1.5 rounded-full", tile.dot)} />
                {tile.label}
              </p>
              <p
                className={cn(
                  "font-bold tabular-nums",
                  isMobile ? "text-base" : "text-xl",
                  value > 0 ? tile.color : "text-muted-foreground",
                )}
              >
                {getFormattedAmount(value)} ₽
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
