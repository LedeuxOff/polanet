import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/developers")({
  component: DevelopersLayout,
});

function DevelopersLayout() {
  return (
    <div className="space-y-4">
      <Outlet />
    </div>
  );
}
