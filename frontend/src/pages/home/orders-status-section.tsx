import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ordersApi, OrdersStatusStats } from "@/lib/api/orders-api";
import { usePermissions } from "@/lib/contexts/permission-context";
import { statusLabels } from "@/pages/orders/list/consts";
import { cn } from "@/lib/utils";
import { ClipboardListIcon } from "lucide-react";

const STATUS_ORDER = ["draft", "new", "in_progress", "completed", "cancelled", "archived"] as const;

const statusColors: Record<string, { dot: string; text: string }> = {
  draft: { dot: "bg-zinc-400", text: "text-zinc-600 dark:text-zinc-300" },
  new: { dot: "bg-sky-500", text: "text-sky-600 dark:text-sky-300" },
  in_progress: { dot: "bg-blue-500 animate-pulse", text: "text-blue-600 dark:text-blue-300" },
  completed: { dot: "bg-green-500", text: "text-green-600 dark:text-green-300" },
  cancelled: { dot: "bg-red-500", text: "text-red-600 dark:text-red-300" },
  archived: { dot: "bg-stone-400", text: "text-stone-500 dark:text-zinc-400" },
};

export const OrdersStatusSection = () => {
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const canView = hasPermission("orders:list");
  const [stats, setStats] = useState<OrdersStatusStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isPermissionsLoading || !canView) return;
    ordersApi
      .statusStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [isPermissionsLoading, canView]);

  if (isPermissionsLoading || !canView) return null;

  return (
    <Card className="col-span-12 rounded-2xl shadow-xl bg-white/10 backdrop-blur-xl border border-white/20">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="dark:text-slate-100">Заявки</CardTitle>
          <CardDescription className="dark:text-slate-200">
            {isLoading ? "Загрузка..." : `Всего заявок: ${stats?.total ?? 0}`}
          </CardDescription>
        </div>
        <Link
          to="/orders"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-300/10 text-violet-400 transition-colors hover:bg-violet-300/20 dark:text-violet-300"
          title="Перейти к заявкам"
        >
          <ClipboardListIcon className="h-5 w-5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {STATUS_ORDER.map((status) => {
            const count = stats?.counts[status] ?? 0;
            const colors = statusColors[status];
            return (
              <Link
                key={status}
                to="/orders"
                className="flex flex-col gap-1 rounded-2xl border border-white/20 bg-white/5 p-3 transition-colors hover:bg-white/15 dark:bg-white/5"
              >
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground dark:text-slate-300">
                  <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
                  {statusLabels[status]}
                </span>
                <span
                  className={cn(
                    "text-2xl font-bold tabular-nums",
                    count > 0 ? colors.text : "text-muted-foreground",
                  )}
                >
                  {isLoading ? "…" : count}
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
