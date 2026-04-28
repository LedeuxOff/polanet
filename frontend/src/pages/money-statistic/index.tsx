import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HomeIcon } from "lucide-react";
import { useMoneyStatistic } from "./hooks";
import { MoneyChart } from "./ui/money-chart";

export const MoneyStatisticPage = () => {
  const navigate = useNavigate();
  const { isLoading, error, candleData } = useMoneyStatistic();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Статистика по финансам</CardTitle>

            <div className="flex items-center gap-2">
              <span className="text-sm text-black">График</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Динамика доходов и расходов по месяцам</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-center text-destructive py-4">{error}</div>}
          <MoneyChart data={candleData} isLoading={isLoading} />
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

      <div className="fixed bottom-8 left-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md">
        <Link to="/">
          <Button type="button" className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900">
            <HomeIcon className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
