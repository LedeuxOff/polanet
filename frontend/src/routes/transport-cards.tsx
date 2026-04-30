import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PermissionGuard } from "@/lib/components/permission-guard";

export const Route = createFileRoute("/transport-cards")({
  component: TransportCardsLayout,
});

function TransportCardsLayout() {
  return (
    <PermissionGuard permission="transport-cards:list">
      <div className="space-y-4">
        <Outlet />
      </div>
    </PermissionGuard>
  );
}
