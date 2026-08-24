import { createFileRoute } from "@tanstack/react-router";
import { DevelopersPage } from "@/pages/developers/list";

export const Route = createFileRoute("/developers/")({
  component: DevelopersPage,
});
