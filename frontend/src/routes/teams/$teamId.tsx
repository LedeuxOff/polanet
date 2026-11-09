import { createFileRoute } from "@tanstack/react-router";
import { TeamDetailPage } from "@/pages/teams/detail";

export const Route = createFileRoute("/teams/$teamId")({
  component: TeamDetailPage,
});
