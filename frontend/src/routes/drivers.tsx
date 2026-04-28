import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PermissionGuard } from "@/lib/components/permission-guard";

export const Route = createFileRoute("/drivers")({
  component: DriversLayout,
});

function DriversLayout() {
  return (
    <PermissionGuard permission="drivers:list">
      <div className="space-y-4">
        <Outlet />
      </div>
    </PermissionGuard>
  );
}
