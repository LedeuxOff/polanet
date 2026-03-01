import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import React from 'react'
import { DataTable } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ColumnDef } from '@tanstack/react-table'
import { api } from '@/lib/api'
import type { Driver } from '@/lib/types'

export const Route = createFileRoute('/drivers/')({
  component: DriversPage,
})

function DriversPage() {
  const navigate = useNavigate()
  const [drivers, setDrivers] = React.useState<Driver[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const loadDrivers = async () => {
    try {
      const data = await api.drivers.list()
      setDrivers(data)
    } catch (error) {
      console.error('Ошибка загрузки водителей:', error)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadDrivers()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого водителя?')) {
      return
    }

    try {
      await api.drivers.delete(id)
      setDrivers(drivers.filter((d) => d.id !== id))
    } catch (error) {
      alert('Ошибка при удалении: ' + (error as Error).message)
    }
  }

  const columns: ColumnDef<Driver>[] = [
    {
      accessorKey: 'lastName',
      header: 'Фамилия',
      cell: ({ row }) => (
        <button
          onClick={() =>
            navigate({
              to: '/drivers/$driverId',
              params: { driverId: String(row.original.id) },
            })
          }
          className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border bg-background hover:bg-muted/50 transition-colors shadow-sm text-sm"
        >
          <span className="font-medium">{row.getValue('lastName')}</span>
        </button>
      ),
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
      accessorKey: 'phone',
      header: 'Телефон',
      cell: ({ getValue }) => getValue<string>() || '—',
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
          <CardTitle>Водители</CardTitle>
          <Link to="/drivers/new">
            <Button>Добавить водителя</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Загрузка...
          </div>
        ) : (
          <DataTable columns={columns} data={drivers} />
        )}
      </CardContent>
    </Card>
  )
}
