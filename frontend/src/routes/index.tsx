import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/contexts/auth-context";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import {
  CalendarDaysIcon,
  CreditCardIcon,
  HeartHandshake,
  MenuIcon,
  UsersIcon,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
      <Card className="col-span-12 rounded-2xl shadow-xl bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="dark:text-slate-100">Добро пожаловать</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="dark:text-slate-200">
            Рады видеть вас снова, {user?.firstName || "Гость"}!
          </p>
        </CardContent>
      </Card>

      <Link to="/users" className="col-span-12 lg:col-span-12">
        <Card className="rounded-2xl shadow-xl relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="dark:text-slate-100">Сотрудники</CardTitle>
            <CardDescription className="dark:text-slate-200">
              Управление сотрудниками системы
            </CardDescription>
          </CardHeader>

          <div className="absolute top-3 right-3">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-blue-300/30 animate-[pulse-ring-expand_2s_ease-in-out_infinite]" />
              <div className="absolute inset-0 rounded-full bg-blue-300/20 animate-[pulse-ring-expand_2s_ease-in-out_infinite_1s]" />
              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-blue-300/10">
                <UsersIcon className="h-10 w-10 text-blue-300" />
              </div>
            </div>
          </div>
        </Card>
      </Link>

      <Link to="/clients" className="col-span-12 lg:col-span-5">
        <Card className="rounded-2xl shadow-xl relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="dark:text-slate-100">Клиенты</CardTitle>
            <CardDescription className="dark:text-slate-200">Просмотр клиентов</CardDescription>
          </CardHeader>

          <div className="absolute top-3 right-3">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-yellow-300/30 animate-[pulse-ring-expand_2s_ease-in-out_infinite]" />
              <div className="absolute inset-0 rounded-full bg-yellow-300/20 animate-[pulse-ring-expand_2s_ease-in-out_infinite_1s]" />
              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-300/10">
                <HeartHandshake className="h-10 w-10 text-yellow-300" />
              </div>
            </div>
          </div>
        </Card>
      </Link>

      <Link to="/transport-cards" className="col-span-12 lg:col-span-7">
        <Card className="rounded-2xl shadow-xl relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="dark:text-slate-100">Транспортные карты</CardTitle>
            <CardDescription className="dark:text-slate-200">
              Управление транспортными картами
            </CardDescription>
          </CardHeader>

          <div className="absolute top-3 right-3">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-green-300/30 animate-[pulse-ring-expand_2s_ease-in-out_infinite]" />
              <div className="absolute inset-0 rounded-full bg-green-300/20 animate-[pulse-ring-expand_2s_ease-in-out_infinite_1s]" />
              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-green-300/10">
                <CreditCardIcon className="h-10 w-10 text-green-300" />
              </div>
            </div>
          </div>
        </Card>
      </Link>

      <Link to="/calendar" className="col-span-12">
        <Card className="rounded-2xl shadow-xl relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="dark:text-slate-100">Календарь доставок</CardTitle>
            <CardDescription className="dark:text-slate-200 max-w-[80%]">
              Многофункциональный календарь с возможностью просмотра предстоящих доставок, а так же
              их создание и редактирование
            </CardDescription>
          </CardHeader>

          <div className="absolute top-3 right-3">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-cyan-300/30 animate-[pulse-ring-expand_2s_ease-in-out_infinite]" />
              <div className="absolute inset-0 rounded-full bg-cyan-300/20 animate-[pulse-ring-expand_2s_ease-in-out_infinite_1s]" />
              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-300/10">
                <CalendarDaysIcon className="h-10 w-10 text-cyan-300" />
              </div>
            </div>
          </div>
        </Card>
      </Link>

      {isMobile && (
        <div
          className={`fixed ${isMobile ? "bottom-2" : "bottom-8"} left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl`}
        >
          <Button
            type="button"
            className="px-3 py-4 rounded-2xl flex gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20"
            onClick={() => setOpen(true)}
          >
            <MenuIcon className="w-4 h-4" /> Меню
          </Button>
        </div>
      )}
    </div>
  );
}
