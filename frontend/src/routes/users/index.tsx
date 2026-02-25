import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import { DataTable } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import type { User } from '@/lib/types'

export const Route = createFileRoute('/users/')({
  component: UsersPage,
})

function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const { user: currentUser, isAuthenticated } = useAuth()

  const loadUsers = async () => {
    try {
      const data = await api.users.list()
      setUsers(data)
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadUsers()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return
    }

    try {
      await api.users.delete(id)
      setUsers(users.filter((u) => u.id !== id))
    } catch (error) {
      alert('Ошибка при удалении: ' + (error as Error).message)
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'lastName',
      header: 'Фамилия',
    },
    {
      accessorKey: 'firstName',
      header: 'Имя',
    },
    {
      accessorKey: 'middleName',
      header: 'Отчество',
      cell: ({ getValue }) => getValue<string>() || '—',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Телефон',
      cell: ({ getValue }) => getValue<string>() || '—',
    },
    {
      accessorKey: 'roleName',
      header: 'Роль',
      cell: ({ getValue }) => getValue<string>() || '—',
    },
    {
      id: 'actions',
      header: 'Действия',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link to="/users/$userId" params={{ userId: String(row.original.id) }}>
            <Button variant="outline" size="sm">
              Редактировать
            </Button>
          </Link>
          {row.original.id !== currentUser?.id && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(row.original.id)}
            >
              Удалить
            </Button>
          )}
        </div>
      ),
    },
  ]

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Пожалуйста, войдите в систему для просмотра пользователей.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Пользователи</CardTitle>
        <Link to="/users/new">
          <Button>Добавить пользователя</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Загрузка...
          </div>
        ) : (
          <DataTable columns={columns} data={users} />
        )}
      </CardContent>
    </Card>
  )
}
