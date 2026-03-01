import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import React from 'react'
import { DataTable } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ColumnDef } from '@tanstack/react-table'
import { api } from '@/lib/api'
import type { Client } from '@/lib/types'

export const Route = createFileRoute('/clients/')({
  component: ClientsPage,
})

function ClientsPage() {
  const navigate = useNavigate()
  const [clients, setClients] = React.useState<Client[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const loadClients = async () => {
    try {
      const data = await api.clients.list()
      setClients(data)
    } catch (error) {
      console.error('Ошибка загрузки клиентов:', error)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadClients()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого клиента?')) {
      return
    }

    try {
      await api.clients.delete(id)
      setClients(clients.filter((c) => c.id !== id))
    } catch (error) {
      alert('Ошибка при удалении: ' + (error as Error).message)
    }
  }

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: 'type',
      header: 'Тип',
      cell: ({ getValue }) => {
        const type = getValue<'individual' | 'legal'>()
        return type === 'individual' ? 'Физ. лицо' : 'Юр. лицо'
      },
    },
    {
      accessorKey: 'name',
      header: 'Наименование',
      cell: ({ row }) => {
        const client = row.original
        const name = client.type === 'individual'
          ? `${client.lastName} ${client.firstName} ${client.middleName || ''}`.trim()
          : client.organizationName || '—'
        
        return (
          <button
            onClick={() =>
              navigate({
                to: '/clients/$clientId',
                params: { clientId: String(row.original.id) },
              })
            }
            className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border bg-background hover:bg-muted/50 transition-colors shadow-sm text-sm"
          >
            <span className="font-medium">{name}</span>
          </button>
        )
      },
    },
    {
      accessorKey: 'phone',
      header: 'Телефон',
      cell: ({ getValue }) => getValue<string>() || '—',
    },
    {
      accessorKey: 'email',
      header: 'Email',
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
          <CardTitle>Клиенты</CardTitle>
          <Link to="/clients/new">
            <Button>Добавить клиента</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Загрузка...
          </div>
        ) : (
          <DataTable columns={columns} data={clients} />
        )}
      </CardContent>
    </Card>
  )
}
