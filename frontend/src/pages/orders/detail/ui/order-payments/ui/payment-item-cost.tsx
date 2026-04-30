import { BadgeRussianRuble } from "lucide-react";
import { paymentMethodLabels } from "../../../consts";

export const OrderPaymentsIncomeItemCost = ({
  amount,
  paymentMethod,
}: {
  amount: number;
  paymentMethod: "cash" | "bank_transfer";
}) => {
  const formattedAmount = new Intl.NumberFormat("ru-RU").format(amount);
  return (
    <div className="flex items-center gap-2">
      <BadgeRussianRuble className="w-4 h-4 text-gray-600" />

      <p className="text-gray-600 text-[14px]">{formattedAmount} ₽</p>

      <span className="text-gray-600 text-[14px]">{paymentMethodLabels[paymentMethod]}</span>
    </div>
  );
};
