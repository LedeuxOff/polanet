import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PermissionGuard } from "@/lib/components/permission-guard";

export const Route = createFileRoute("/system-logs")({
  component: SystemLogsLayout,
});

function SystemLogsLayout() {
  return (
    <PermissionGuard permission="system-logs:view">
      <div className="space-y-4">
        <Outlet />
      </div>
    </PermissionGuard>
  );
}
