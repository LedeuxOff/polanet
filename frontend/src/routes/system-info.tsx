import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PermissionGuard } from "@/lib/components/permission-guard";

export const Route = createFileRoute("/system-info")({
  component: SystemInfoLayout,
});

function SystemInfoLayout() {
  return (
    <PermissionGuard permission="system-info:view">
      <div className="space-y-4">
        <Outlet />
      </div>
    </PermissionGuard>
  );
}
