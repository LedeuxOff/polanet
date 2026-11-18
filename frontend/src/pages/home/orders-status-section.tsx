import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ordersApi, OrdersStatusStats } from "@/lib/api/orders-api";
import { usePermissions } from "@/lib/contexts/permission-context";
import { statusLabels } from "@/pages/orders/list/consts";
import { cn } from "@/lib/utils";
import { ClipboardListIcon } from "lucide-react";
import { cardTints, homeCardClass, SectionIcon, statTileClass, TileAccent } from "./ui-parts";

const STATUS_ORDER = ["draft", "new", "in_progress", "completed", "cancelled", "archived"] as const;

const statusColors: Record<string, { dot: string; text: string }> = {
  draft: { dot: "bg-zinc-400", text: "text-zinc-600 dark:text-zinc-100" },
  new: { dot: "bg-sky-500", text: "text-sky-600 dark:text-sky-300" },
  in_progress: { dot: "bg-blue-500", text: "text-blue-600 dark:text-blue-300" },
  completed: { dot: "bg-green-500", text: "text-green-600 dark:text-green-300" },
  cancelled: { dot: "bg-red-500", text: "text-red-600 dark:text-red-300" },
  archived: { dot: "bg-stone-400", text: "text-stone-600 dark:text-stone-200" },
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
    <Card className={cn(homeCardClass, cardTints.violet, "col-span-12")}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="text-slate-900 dark:text-slate-100">Заявки</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-300">
            {isLoading ? "Загрузка..." : `Всего заявок: ${stats?.total ?? 0}`}
          </CardDescription>
        </div>
        <Link
          to="/orders"
          title="Перейти к заявкам"
          className="rounded-xl transition-opacity hover:opacity-80"
        >
          <SectionIcon color="violet">
            <ClipboardListIcon />
          </SectionIcon>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {STATUS_ORDER.map((status) => {
            const count = stats?.counts[status] ?? 0;
            const colors = statusColors[status];
            return (
              <Link key={status} to="/orders" className={cn(statTileClass, "cursor-pointer")}>
                <TileAccent className={colors.dot} />
                <span className="flex items-center gap-1.5 text-xs font-medium leading-5 text-slate-500 dark:text-slate-200">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      colors.dot,
                      status === "in_progress" && "animate-pulse",
                    )}
                  />
                  {statusLabels[status]}
                </span>
                <span
                  className={cn(
                    "text-3xl font-bold leading-none tracking-tight tabular-nums",
                    count > 0 ? colors.text : "text-slate-400 dark:text-slate-300",
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
