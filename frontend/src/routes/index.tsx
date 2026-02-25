import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth-context'
import React from 'react'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { user, isAuthenticated, isLoading } = useAuth()

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Можно показать редирект, но пока оставим так
    }
  }, [isLoading, isAuthenticated])

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Загрузка...
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Добро пожаловать</CardTitle>
          <CardDescription>
            Административная панель Polanet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Рады видеть вас снова, {user?.firstName || 'Гость'}!
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Пользователи</CardTitle>
          <CardDescription>
            Управление пользователями системы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/users">
            <Button>Перейти к пользователям</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Роли</CardTitle>
          <CardDescription>
            Управление ролями и доступом
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            В разработке...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
