import { createFileRoute } from "@tanstack/react-router";
import { RolesPage } from "@/pages/roles/list";

export const Route = createFileRoute("/roles/")({
  component: RolesPage,
});
