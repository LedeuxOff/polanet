import { createFileRoute } from "@tanstack/react-router";
import { TransportCardDetailPage } from "@/pages/transport-cards/detail";

export const Route = createFileRoute("/transport-cards/$cardId")({
  component: TransportCardDetailPage,
});
