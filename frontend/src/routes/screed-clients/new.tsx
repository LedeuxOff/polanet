import { createFileRoute } from "@tanstack/react-router";
import { NewScreedClientPage } from "@/pages/screed-clients/new";

export const Route = createFileRoute("/screed-clients/new")({
  component: NewScreedClientPage,
});
