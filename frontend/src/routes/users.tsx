import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/users")({
  component: UsersLayout,
});

function UsersLayout() {
  return (
    <div className="space-y-4">
      <Outlet />
    </div>
  );
}
