import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export const NewUserPageHead = () => {
  return (
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <CardTitle>Сотрудники</CardTitle>

          <Breadcrumbs
            items={[
              { label: "Список сотрудников", active: false, href: "/users" },
              { label: "Создание сотрудника", active: true },
            ]}
          />
        </div>
      </CardHeader>
    </Card>
  );
};
