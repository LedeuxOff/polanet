import { createFileRoute } from "@tanstack/react-router";
import { NewDeveloperPage } from "@/pages/developers/new";

export const Route = createFileRoute("/developers/new")({
  component: NewDeveloperPage,
});
