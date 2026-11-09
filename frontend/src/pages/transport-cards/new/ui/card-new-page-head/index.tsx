import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export const CardNewPageHead = () => {
  return (
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <CardTitle>Топливные карты</CardTitle>

          <Breadcrumbs
            items={[
              { label: "Список", active: false, href: "/transport-cards" },
              { label: "Создание", active: true },
            ]}
          />
        </div>
      </CardHeader>
    </Card>
  );
};
