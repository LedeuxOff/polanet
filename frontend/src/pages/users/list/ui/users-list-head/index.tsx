import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export const UsersListPageHead = () => {
  return (
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle className="dark:text-slate-100">Сотрудники</CardTitle>
        </div>
      </CardHeader>
    </Card>
  );
};
