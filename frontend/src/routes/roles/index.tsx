import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import React from 'react'
import { DataTable } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ColumnDef } from '@tanstack/react-table'
import { api } from '@/lib/api'
import type { Role } from '@/lib/types'

export const Route = createFileRoute('/roles/')({
  component: RolesPage,
})

function RolesPage() {
  const navigate = useNavigate()
  const [roles, setRoles] = React.useState<Role[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const loadRoles = async () => {
    try {
      const data = await api.roles.list()
      setRoles(data)
    } catch (error) {
      console.error('Ошибка загрузки ролей:', error)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadRoles()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту роль?')) {
      return
    }

    try {
      await api.roles.delete(id)
      setRoles(roles.filter((r) => r.id !== id))
    } catch (error) {
      alert('Ошибка при удалении: ' + (error as Error).message)
    }
  }

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: 'code',
      header: 'Код',
      cell: ({ row }) => (
        <button
          onClick={() =>
            navigate({
              to: '/roles/$roleId',
              params: { roleId: String(row.original.id) },
            })
          }
          className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border bg-background hover:bg-muted/50 transition-colors shadow-sm text-sm"
        >
          <span className="font-medium">{row.getValue('code')}</span>
        </button>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Название',
    },
    {
      id: 'actions',
      header: 'Действия',
      cell: ({ row }) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleDelete(row.original.id)}
        >
          Удалить
        </Button>
      ),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Роли</CardTitle>
          <Link to="/roles/new">
            <Button>Добавить роль</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Загрузка...
          </div>
        ) : (
          <DataTable columns={columns} data={roles} />
        )}
      </CardContent>
    </Card>
  )
}
