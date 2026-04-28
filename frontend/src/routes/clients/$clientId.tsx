import { createFileRoute } from "@tanstack/react-router";
import { EditClientPage } from "@/pages/clients/detail";

export const Route = createFileRoute("/clients/$clientId")({
  component: EditClientPage,
});
