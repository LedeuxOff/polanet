import { MoneyStatisticPage } from "@/pages/money-statistic";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/money-statistic/")({
  component: MoneyStatisticPage,
});
