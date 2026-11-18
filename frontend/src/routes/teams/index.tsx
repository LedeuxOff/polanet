import { createFileRoute } from "@tanstack/react-router";
import { TeamsPage } from "@/pages/teams/list";

export const Route = createFileRoute("/teams/")({
  component: TeamsPage,
});
