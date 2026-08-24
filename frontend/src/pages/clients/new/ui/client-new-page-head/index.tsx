import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export const ClientNewPageHead = () => {
  return (
    <Card className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <CardTitle>Клиенты</CardTitle>

          <Breadcrumbs
            items={[
              { label: "Список", href: "/clients", active: false },
              { label: "Создание", active: true },
            ]}
          />
        </div>
      </CardHeader>
    </Card>
  );
};
