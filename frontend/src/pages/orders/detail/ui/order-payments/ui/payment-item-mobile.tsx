import { Badge } from "@/components/ui/badge";
import { OrderPaymentsIncomeItemStatus } from "./payment-item-status";
import { OrderPaymentsIncomeItemType } from "./payment-item-type";
import { OrderPaymentsIncomeItemCost } from "./payment-item-cost";
import { CalendarIcon } from "lucide-react";
import { Income } from "@/lib/types";

interface Props {
  income: Income;
}

export const PaymentItemMobile = ({ income }: Props) => {
  return (
    <div className="flex flex-col gap-4 border rounded-md p-4">
      <div className="flex justify-between gap-4">
        <OrderPaymentsIncomeItemStatus isPaid={income.isPaid} />
        {income.deliveryId && <Badge variant="outline">№ {income.deliveryId}</Badge>}
      </div>

      <div>
        <OrderPaymentsIncomeItemType incomeType={income.incomeType} />
      </div>

      <div className="flex flex-col gap-2">
        <OrderPaymentsIncomeItemCost amount={income.amount} paymentMethod={income.paymentMethod} />

        <div className="flex items-center gap-2 text-[14px] text-gray-600">
          <CalendarIcon className="w-4 h-4" />
          <span>{new Date(income.paymentDate).toLocaleDateString("ru-RU")}</span>
        </div>
      </div>
    </div>
  );
};
