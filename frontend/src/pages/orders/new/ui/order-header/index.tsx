import { CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

export const OrderHeader = () => {
  return (
    <div className="flex flex-col gap-2">
      <CardTitle>Заявки</CardTitle>

      <div className="flex items-center gap-2">
        <Link to="/orders" className="text-sm text-muted-foreground">
          Список заявок
        </Link>

        <span className="text-sm text-muted-foreground">/</span>

        <span className="text-sm text-black">Новая заявка</span>
      </div>
    </div>
  );
};
