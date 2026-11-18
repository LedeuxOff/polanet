import { createFileRoute } from "@tanstack/react-router";
import { OperationsStatisticPage } from "@/pages/statistics/operations";

export const Route = createFileRoute("/statistics/operations")({
  component: OperationsStatisticPage,
});
