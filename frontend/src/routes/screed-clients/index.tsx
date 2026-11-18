import { createFileRoute } from "@tanstack/react-router";
import { ScreedClientsPage } from "@/pages/screed-clients/list";

export const Route = createFileRoute("/screed-clients/")({
  component: ScreedClientsPage,
});
