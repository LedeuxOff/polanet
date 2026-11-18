import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PermissionGuard } from "@/lib/components/permission-guard";

export const Route = createFileRoute("/teams")({
  component: TeamsLayout,
});

function TeamsLayout() {
  return (
    <PermissionGuard permission="teams:list">
      <div className="space-y-4">
        <Outlet />
      </div>
    </PermissionGuard>
  );
}
