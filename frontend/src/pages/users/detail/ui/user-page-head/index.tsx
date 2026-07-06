import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/lib/types";

interface Props {
  user: User;
}

export const UserPageHead = ({ user }: Props) => {
  return (
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <CardTitle>Сотрудники</CardTitle>

          <Breadcrumbs
            items={[
              { label: "Список сотрудников", active: false, href: "/users" },
              { label: `${user.firstName} ${user.lastName}`, active: true },
            ]}
          />
        </div>
      </CardHeader>
    </Card>
  );
};
