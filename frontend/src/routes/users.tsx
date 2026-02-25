import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/users')({
  component: () => (
    <div className="space-y-4">
      <Outlet />
    </div>
  ),
})
