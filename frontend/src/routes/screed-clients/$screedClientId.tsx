import { createFileRoute } from "@tanstack/react-router";
import { ScreedClientDetailPage } from "@/pages/screed-clients/detail";

export const Route = createFileRoute("/screed-clients/$screedClientId")({
  component: ScreedClientDetailPage,
});
