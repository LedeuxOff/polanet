import { cn } from "@/lib/utils";
import { TruckIcon, WalletIcon } from "lucide-react";

export const OrderPaymentsIncomeItemType = ({
  incomeType,
  className,
}: {
  incomeType: "prepayment" | "delivery_payment";
  className?: string;
}) => (
  <div
    className={cn(
      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
      incomeType === "prepayment"
        ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200"
        : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
      className,
    )}
  >
    {incomeType === "prepayment" ? (
      <WalletIcon className="h-5 w-5" />
    ) : (
      <TruckIcon className="h-5 w-5" />
    )}
  </div>
);
