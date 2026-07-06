import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from "@/lib/types";

export const CarPageHead = ({ car }: { car: Car }) => {
  return (
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <CardTitle>Автомобили</CardTitle>

          <Breadcrumbs
            items={[
              { label: "Список", active: false, href: "/cars" },
              { label: `${car.brand}`, active: true },
            ]}
          />
        </div>
      </CardHeader>
    </Card>
  );
};
