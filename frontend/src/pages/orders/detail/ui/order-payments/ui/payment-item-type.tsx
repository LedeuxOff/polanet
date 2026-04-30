import { Badge } from "@/components/ui/badge";
import { incomeTypeLabels } from "../../../consts";

export const OrderPaymentsIncomeItemType = ({
  incomeType,
}: {
  incomeType: "prepayment" | "delivery_payment";
}) => <Badge variant="outline">{incomeTypeLabels[incomeType]}</Badge>;
