import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const { isAuthenticated, logout, user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Polanet Admin</h1>
            {isAuthenticated && (
              <nav className="flex items-center gap-4">
                <Link to="/">
                  <Button variant="ghost" size="sm">Главная</Button>
                </Link>
                <Link to="/users">
                  <Button variant="ghost" size="sm">Пользователи</Button>
                </Link>
                <Link to="/users/new">
                  <Button variant="ghost" size="sm">Новый</Button>
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated && user && (
              <span className="text-sm text-muted-foreground">
                {user.firstName} {user.lastName}
              </span>
            )}
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={logout}>
                Выход
              </Button>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">Вход</Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
