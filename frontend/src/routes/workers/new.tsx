import { createFileRoute } from "@tanstack/react-router";
import { NewWorkerPage } from "@/pages/workers/new";

export const Route = createFileRoute("/workers/new")({
  component: NewWorkerPage,
});
