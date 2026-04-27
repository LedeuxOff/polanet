import { OrderDetailPage } from "@/pages/orders/detail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/orders/$orderId")({
  component: OrderDetailPage,
});
