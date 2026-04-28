import { createFileRoute } from "@tanstack/react-router";
import { NewRolePage } from "@/pages/roles/new";

export const Route = createFileRoute("/roles/new")({
  component: NewRolePage,
});
