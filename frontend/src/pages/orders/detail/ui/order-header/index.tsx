import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Order } from "@/lib/types";
import { typeLabels } from "../../consts";

interface Props {
  isNewOrder: boolean;
  orderId: string;
  order: Order | null;
}

export const OrderHeader = ({ isNewOrder, orderId, order }: Props) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>{isNewOrder ? "Новая заявка" : `Заявка #${orderId}`}</CardTitle>
        {order && !isNewOrder && (
          <p className="text-sm text-muted-foreground mt-1">
            {typeLabels[order.type]} • {order.address}
          </p>
        )}
      </div>
    </div>
  );
};
