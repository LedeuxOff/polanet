import { createFileRoute } from "@tanstack/react-router";
import { NewTeamPage } from "@/pages/teams/new";

export const Route = createFileRoute("/teams/new")({
  component: NewTeamPage,
});
