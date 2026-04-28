import { createFileRoute } from "@tanstack/react-router";
import { OrdersPage } from "@/pages/orders/list";

export const Route = createFileRoute("/orders/")({
  component: OrdersPage,
});
