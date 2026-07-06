import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "@/lib/types";

export const ClientPageHead = ({ client }: { client: Client }) => {
  return (
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <CardTitle>Клиенты</CardTitle>

          <Breadcrumbs
            items={[
              { label: "Список", active: false, href: "/clients" },
              {
                label: `${
                  client.type === "individual"
                    ? `${client.lastName} ${client.firstName} ${client.middleName || ""}`.trim()
                    : client.organizationName
                }`,
                active: true,
              },
            ]}
          />
        </div>
      </CardHeader>
    </Card>
  );
};
