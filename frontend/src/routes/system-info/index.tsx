import { createFileRoute } from "@tanstack/react-router";
import { SystemInfoPage } from "@/pages/system-info";

export const Route = createFileRoute("/system-info/")({
  component: SystemInfoPage,
});
