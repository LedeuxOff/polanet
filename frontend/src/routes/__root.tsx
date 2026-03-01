import { createRootRoute, Outlet, Link, useNavigate, useLocation } from '@tanstack/react-router'
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import React from 'react'
import { Home, Users, LogOut, Car, User, Shield, Building, ClipboardList } from 'lucide-react'

export const Route = createRootRoute({
  component: RootLayout,
})

const menuItems = [
  {
    title: 'Главная',
    url: '/',
    icon: Home,
  },
  {
    title: 'Пользователи',
    url: '/users',
    icon: Users,
  },
  {
    title: 'Заявки',
    url: '/orders',
    icon: ClipboardList,
  },
  {
    title: 'Автомобили',
    url: '/cars',
    icon: Car,
  },
  {
    title: 'Водители',
    url: '/drivers',
    icon: User,
  },
  {
    title: 'Клиенты',
    url: '/clients',
    icon: Building,
  },
  {
    title: 'Роли',
    url: '/roles',
    icon: Shield,
  },
]

function RootLayout() {
  const { isAuthenticated, logout, user, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isLoginPage = location.pathname === '/login'

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      navigate({
        to: '/login',
        search: { redirect: location.href },
        replace: true,
      })
    }
    
    if (isAuthenticated && isLoginPage) {
      navigate({ to: '/' })
    }
  }, [isAuthenticated, isLoginPage, navigate, location.href, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  if (!isAuthenticated && isLoginPage) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    )
  }

  if (!isAuthenticated && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Перенаправление...</div>
      </div>
    )
  }

  if (isAuthenticated && isLoginPage) {
    navigate({ to: '/' })
    return null
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="h-14 flex items-center px-4 border-b">
          <span className="font-semibold">Polanet Admin</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Меню</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => {
                  logout()
                  navigate({ to: '/login' })
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>Выйти</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-2 border-b px-4 shrink-0">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
