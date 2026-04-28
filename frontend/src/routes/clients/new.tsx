import { createFileRoute } from "@tanstack/react-router";
import { NewClientPage } from "@/pages/clients/new";

export const Route = createFileRoute("/clients/new")({
  component: NewClientPage,
});
