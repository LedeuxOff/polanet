import { createFileRoute } from "@tanstack/react-router";
import { SystemLogsPage } from "@/pages/system-logs";

export const Route = createFileRoute("/system-logs/")({
  component: SystemLogsPage,
});
