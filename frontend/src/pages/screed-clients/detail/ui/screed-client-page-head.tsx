import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export const ScreedClientPageHead = ({ title }: { title: string }) => (
  <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
    <CardHeader>
      <div className="flex flex-col gap-4">
        <CardTitle>Клиенты стяжки</CardTitle>
        <Breadcrumbs
          items={[
            { label: "Список", href: "/screed-clients", active: false },
            { label: title, active: true },
          ]}
        />
      </div>
    </CardHeader>
  </Card>
);
