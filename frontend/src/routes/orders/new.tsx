import { createFileRoute } from "@tanstack/react-router";
import { NewOrderDetailPage } from "@/pages/orders/new";

export const Route = createFileRoute("/orders/new")({
  component: NewOrderDetailPage,
});
