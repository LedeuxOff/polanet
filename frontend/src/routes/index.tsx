import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/contexts/auth-context";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { OrdersStatusSection } from "@/pages/home/orders-status-section";
import { DeliveriesCalendarSection } from "@/pages/home/deliveries-calendar-section";
import {
  ClientsSection,
  EmployeesSection,
  TransportCardsSection,
} from "@/pages/home/summary-sections";
import { MenuIcon } from "lucide-react";

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

      <OrdersStatusSection />

      <EmployeesSection />

      <ClientsSection />

      <TransportCardsSection />

      <DeliveriesCalendarSection />

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
