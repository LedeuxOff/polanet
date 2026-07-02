import { createFileRoute, Outlet } from "@tanstack/react-router";

function TemplatesLayout() {
  return <Outlet />;
}

export const Route = createFileRoute("/templates")({
  component: TemplatesLayout,
});
