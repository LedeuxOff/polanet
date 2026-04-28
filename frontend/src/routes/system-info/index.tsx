import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { SystemInfoPage } from "@/pages/system-info";

export const Route = createFileRoute("/system-info/")({
  component: SystemInfoPage,
});
