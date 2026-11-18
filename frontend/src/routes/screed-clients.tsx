import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PermissionGuard } from "@/lib/components/permission-guard";

export const Route = createFileRoute("/screed-clients")({
  component: ScreedClientsLayout,
});

function ScreedClientsLayout() {
  return (
    <PermissionGuard permission="screed-clients:list">
      <div className="space-y-4">
        <Outlet />
      </div>
    </PermissionGuard>
  );
}
