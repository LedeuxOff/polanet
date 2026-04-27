import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Order } from "@/lib/types";
import { typeLabels } from "../../consts";
import { Link } from "@tanstack/react-router";

interface Props {
  isNewOrder: boolean;
  orderId: string;
  order: Order | null;
}

export const OrderHeader = ({ isNewOrder, orderId, order }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <CardTitle>Заявки</CardTitle>

      <div className="flex items-center gap-2">
        <Link to="/orders" className="text-sm text-muted-foreground">
          Список заявок
        </Link>

        <span className="text-sm text-muted-foreground">/</span>

        <span className="text-sm text-black">
          {isNewOrder ? "Новая заявка" : `Заявка #${orderId}`}
        </span>
      </div>
    </div>
  );
};
