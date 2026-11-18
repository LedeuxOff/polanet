import { createFileRoute } from "@tanstack/react-router";
import { WorkerDetailPage } from "@/pages/workers/detail";

export const Route = createFileRoute("/workers/$workerId")({
  component: WorkerDetailPage,
});
