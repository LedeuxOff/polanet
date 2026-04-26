import { createFileRoute } from "@tanstack/react-router";
import { NewTransportCardPage } from "@/pages/transport-cards/new";

export const Route = createFileRoute("/transport-cards/new")({
  component: NewTransportCardPage,
});
