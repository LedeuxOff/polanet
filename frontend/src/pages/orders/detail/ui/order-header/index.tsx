import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";
import { Order } from "@/lib/types";
import { Link } from "@tanstack/react-router";

interface Props {
  isNewOrder: boolean;
  orderId: string;
  order: Order | null;
}

export const OrderHeader = ({ isNewOrder, orderId }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <CardTitle>Заявки</CardTitle>

      <div className="flex items-center gap-2">
        <Link to="/orders" className="text-sm text-muted-foreground">
          <Badge variant="outline">Список заявок</Badge>
        </Link>

        <span className="w-1 h-1 bg-blue-400 rounded-full" />

        <Badge variant="secondary">{isNewOrder ? "Новая заявка" : `Заявка #${orderId}`}</Badge>
      </div>
    </div>
  );
};
