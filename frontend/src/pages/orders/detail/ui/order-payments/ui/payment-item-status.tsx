import { Badge } from "@/components/ui/badge";

export const OrderPaymentsIncomeItemStatus = ({ isPaid }: { isPaid: boolean }) => {
  if (isPaid) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-700">
        Оплачен
      </Badge>
    );
  }

  return <Badge variant="secondary">Не оплачено</Badge>;
};
