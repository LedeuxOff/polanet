import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/lib/types";

interface Props {
  orderId: string;
  order: Order | null;
}

export const OrderHeader = ({ orderId }: Props) => {
  return (
    <Card className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <CardTitle>Заявки</CardTitle>

          <Breadcrumbs
            items={[
              { label: "Список", active: false, href: "/orders" },
              { label: `Заявка #${orderId}`, active: true },
            ]}
          />
        </div>
      </CardHeader>
    </Card>
  );
};
