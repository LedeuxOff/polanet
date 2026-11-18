import { Income } from "@/lib/types";
import { getFormattedAmount } from "@/lib/utils";
import { incomeTypeLabels, paymentMethodLabels } from "../../../consts";
import { OrderPaymentsIncomeItemStatus } from "./payment-item-status";
import { OrderPaymentsIncomeItemType } from "./payment-item-type";

interface Props {
  income: Income;
}

export const PaymentItemDesktop = ({ income }: Props) => (
  <div className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30 dark:hover:bg-white/5">
    <OrderPaymentsIncomeItemType incomeType={income.incomeType} />

    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-2">
        <span className="font-medium">{incomeTypeLabels[income.incomeType]}</span>
        {income.deliveryId && (
          <span className="rounded-md bg-muted px-1.5 text-xs text-muted-foreground dark:bg-white/10">
            Доставка № {income.deliveryId}
          </span>
        )}
      </div>
      <span className="text-sm text-muted-foreground">
        {new Date(income.paymentDate).toLocaleDateString("ru-RU")} ·{" "}
        {paymentMethodLabels[income.paymentMethod]}
      </span>
    </div>

    <OrderPaymentsIncomeItemStatus isPaid={income.isPaid} />

    <span className="w-32 text-right text-base font-semibold tabular-nums">
      {getFormattedAmount(income.amount)} ₽
    </span>
  </div>
);
