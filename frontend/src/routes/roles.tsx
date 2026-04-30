import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PermissionGuard } from "@/lib/components/permission-guard";

export const Route = createFileRoute("/roles")({
  component: RolesLayout,
});

function RolesLayout() {
  return (
    <PermissionGuard permission="roles:list">
      <div className="space-y-4">
        <Outlet />
      </div>
    </PermissionGuard>
  );
}
