import { createFileRoute } from "@tanstack/react-router";
import { EditRolePage } from "@/pages/roles/detail";

export const Route = createFileRoute("/roles/$roleId")({
  component: EditRolePage,
});
