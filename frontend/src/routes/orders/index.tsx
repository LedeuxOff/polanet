import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import React from 'react'
import { DataTable } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ColumnDef } from '@tanstack/react-table'
import { api } from '@/lib/api'
import type { Order } from '@/lib/types'

export const Route = createFileRoute('/orders/')({
  component: OrdersPage,
})

const statusLabels: Record<string, string> = {
  new: 'Новая',
  in_progress: 'Выполняется',
  completed: 'Завершено',
  cancelled: 'Отменено',
  archived: 'Архив',
  draft: 'Черновик',
}

const paymentStatusLabels: Record<string, string> = {
  unpaid: 'Не оплачено',
  paid: 'Оплачено',
  partial: 'Частично',
}

const typeLabels: Record<string, string> = {
  delivery: 'Доставка',
  pickup: 'Вывоз',
}

function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = React.useState<(Order & { payments: any[]; totalPaid: number; debt: number; isPaid: boolean; paymentStatus: string })[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const loadOrders = async () => {
    try {
      const data = await api.orders.list()
      setOrders(data)
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadOrders()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) {
      return
    }

    try {
      await api.orders.delete(id)
      setOrders(orders.filter((o) => o.id !== id))
    } catch (error) {
      alert('Ошибка при удалении: ' + (error as Error).message)
    }
  }

  const columns: ColumnDef<typeof orders[0]>[] = [
    {
      accessorKey: 'id',
      header: '№',
      cell: ({ getValue }) => `#${getValue<number>()}`,
    },
    {
      accessorKey: 'type',
      header: 'Тип',
      cell: ({ getValue }) => typeLabels[getValue<string>()] || getValue<string>(),
    },
    {
      accessorKey: 'address',
      header: 'Адрес',
      cell: ({ row }) => (
        <button
          onClick={() =>
            navigate({
              to: '/orders/$orderId',
              params: { orderId: String(row.original.id) },
            })
          }
          className="text-left hover:underline text-primary"
        >
          {row.getValue('address')}
        </button>
      ),
    },
    {
      accessorKey: 'cost',
      header: 'Стоимость',
      cell: ({ getValue }) => `${getValue<number>()} ₽`,
    },
    {
      accessorKey: 'status',
      header: 'Статус',
      cell: ({ getValue }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {statusLabels[getValue<string>()] || getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Оплата',
      cell: ({ row }) => {
        const status = row.original.paymentStatus
        const colors = {
          unpaid: 'text-destructive',
          paid: 'text-green-600',
          partial: 'text-yellow-600',
        }
        return (
          <span className={`text-sm font-medium ${colors[status as keyof typeof colors] || ''}`}>
            {paymentStatusLabels[status] || status}
          </span>
        )
      },
    },
    {
      accessorKey: 'debt',
      header: 'Долг',
      cell: ({ row }) => {
        const debt = row.original.debt
        return debt > 0 ? (
          <span className="text-destructive font-medium">{debt} ₽</span>
        ) : (
          <span className="text-green-600 font-medium">—</span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Действия',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate({
                to: '/orders/$orderId',
                params: { orderId: String(row.original.id) },
              })
            }
          >
            Открыть
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
          >
            Удалить
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Заявки</CardTitle>
          <Link to="/orders/new">
            <Button>Создать заявку</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Загрузка...
          </div>
        ) : (
          <DataTable columns={columns} data={orders} />
        )}
      </CardContent>
    </Card>
  )
}
