import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

export const OrderHeader = () => {
  return (
    <div className="flex flex-col gap-4">
      <CardTitle>Заявки</CardTitle>

      <div className="flex items-center gap-2">
        <Link to="/orders" className="text-sm text-muted-foreground">
          <Badge variant="outline">Список заявок</Badge>
        </Link>

        <span className="w-1 h-1 bg-blue-400 rounded-full" />

        <Badge variant="secondary">Новая заявка</Badge>
      </div>
    </div>
  );
};
