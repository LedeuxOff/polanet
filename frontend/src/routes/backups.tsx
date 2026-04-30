import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PermissionGuard } from "@/lib/components/permission-guard";

export const Route = createFileRoute("/backups")({
  component: BackupsLayout,
});

function BackupsLayout() {
  return (
    <PermissionGuard permission="backups:list">
      <div className="space-y-4">
        <Outlet />
      </div>
    </PermissionGuard>
  );
}
