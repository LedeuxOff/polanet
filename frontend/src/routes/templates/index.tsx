import { createFileRoute } from "@tanstack/react-router";
import { TemplatesPage } from "@/pages/templates/list";

export const Route = createFileRoute("/templates/")({
  component: TemplatesPage,
});
