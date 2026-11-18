import { createFileRoute } from "@tanstack/react-router";
import { useIsMobile } from "@/hooks";
import { OrdersStatusSection } from "@/pages/home/orders-status-section";
import { DeliveriesCalendarSection } from "@/pages/home/deliveries-calendar-section";
import {
  ClientsSection,
  EmployeesSection,
  TransportCardsSection,
} from "@/pages/home/summary-sections";
import { BottomBar } from "@/components/bottom-bar";
import { WelcomeSection } from "@/pages/home/welcome-section";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const isMobile = useIsMobile();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
      <WelcomeSection />

      <OrdersStatusSection />

      <EmployeesSection />

      <ClientsSection />

      <TransportCardsSection />

      <DeliveriesCalendarSection />

      {isMobile && <BottomBar hideSaveButton />}
    </div>
  );
}
