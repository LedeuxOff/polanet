import { createFileRoute } from "@tanstack/react-router";
import { WorksStatisticPage } from "@/pages/statistics/works";

export const Route = createFileRoute("/statistics/works")({
  component: WorksStatisticPage,
});
