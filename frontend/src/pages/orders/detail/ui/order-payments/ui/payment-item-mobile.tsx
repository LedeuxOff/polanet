import { Income } from "@/lib/types";
import { getFormattedAmount } from "@/lib/utils";
import { incomeTypeLabels, paymentMethodLabels } from "../../../consts";
import { OrderPaymentsIncomeItemStatus } from "./payment-item-status";
import { OrderPaymentsIncomeItemType } from "./payment-item-type";

interface Props {
  income: Income;
}

export const PaymentItemMobile = ({ income }: Props) => (
  <div className="flex items-start gap-3 px-3 py-3">
    <OrderPaymentsIncomeItemType incomeType={income.incomeType} />

    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium leading-tight">{incomeTypeLabels[income.incomeType]}</span>
        <span className="shrink-0 font-semibold tabular-nums">
          {getFormattedAmount(income.amount)} ₽
        </span>
      </div>
      <span className="text-xs text-muted-foreground">
        {new Date(income.paymentDate).toLocaleDateString("ru-RU")} ·{" "}
        {paymentMethodLabels[income.paymentMethod]}
        {income.deliveryId && ` · Доставка № ${income.deliveryId}`}
      </span>
      <div>
        <OrderPaymentsIncomeItemStatus isPaid={income.isPaid} />
      </div>
    </div>
  </div>
);
