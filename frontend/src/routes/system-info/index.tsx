import { SystemInfoPage } from "@/pages/system-info";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/system-info/")({
  component: SystemInfoPage,
});
