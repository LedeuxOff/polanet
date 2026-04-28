import { createFileRoute } from "@tanstack/react-router";
import { TransportCardsPage } from "@/pages/transport-cards/list";

export const Route = createFileRoute("/transport-cards/")({
  component: TransportCardsPage,
});
