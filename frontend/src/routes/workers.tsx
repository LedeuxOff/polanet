import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PermissionGuard } from "@/lib/components/permission-guard";

export const Route = createFileRoute("/workers")({
  component: WorkersLayout,
});

function WorkersLayout() {
  return (
    <PermissionGuard permission="workers:list">
      <div className="space-y-4">
        <Outlet />
      </div>
    </PermissionGuard>
  );
}
