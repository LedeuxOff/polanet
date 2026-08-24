import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, HomeIcon, MenuIcon } from "lucide-react";
import { useMoneyStatistic } from "./hooks";
import { MoneyChart } from "./ui/money-chart";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { useState } from "react";

export const MoneyStatisticPage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);

  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();
  const { isLoading, error, candleData } = useMoneyStatistic();

  if (isPermissionsLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Загрузка...</CardContent>
      </Card>
    );
  }

  if (!hasPermission("finances:view")) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">У вас нет доступа к этой странице</p>
          <Link to="/">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Вернуться на главную
            </button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-24">
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle>Статистика по финансам</CardTitle>
        </CardHeader>
      </Card>

      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle>Динамика доходов и расходов по месяцам</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {error && <div className="text-center text-destructive py-4">{error}</div>}

          <div className="min-w-[900px]">
            <MoneyChart data={candleData} isLoading={isLoading} />
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Расходы</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Доходы (оплата доставки)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div
        className={`fixed transition-all ${isMobile ? "bottom-2" : hideBottomTabbar ? "-bottom-14" : "bottom-4"} left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-zinc-600/30 backdrop-blur-md shadow-xl border-zinc-200 rounded-2xl`}
      >
        <div
          onClick={() => setHideBottomTabbar(false)}
          className={`absolute -top-4 left-1/2 -translate-x-1/2 px-1 pb-2 bg-[rgb(194,194,197)] rounded-2xl hover:bg-[rgb(173,173,176)] flex items-center justify-center cursor-pointer z-10 transition-all ${hideBottomTabbar ? "opacity-100" : "opacity-0"}`}
        >
          <ChevronUp className="text-white w-5" />
        </div>

        <Link to="/">
          <Button type="button" className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600">
            <HomeIcon className="w-4 h-4" />
          </Button>
        </Link>

        {isMobile && (
          <Button
            type="button"
            className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
            onClick={() => setOpen(true)}
          >
            <MenuIcon className="w-4 h-4" />
          </Button>
        )}

        <Button
          onClick={() => setHideBottomTabbar(true)}
          type="button"
          className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
