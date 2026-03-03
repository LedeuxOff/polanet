import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import React from 'react'
import { DataTable } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ColumnDef } from '@tanstack/react-table'
import { api } from '@/lib/api'
import type { TransportCard } from '@/lib/types'

export const Route = createFileRoute('/transport-cards/')({
  component: TransportCardsPage,
})

function TransportCardsPage() {
  const navigate = useNavigate()
  const [cards, setCards] = React.useState<(TransportCard & { expenses: any[]; totalExpenses: number })[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const loadCards = async () => {
    try {
      const data = await api.transportCards.list()
      setCards(data)
    } catch (error) {
      console.error('Ошибка загрузки транспортных карт:', error)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadCards()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту транспортную карту?')) {
      return
    }

    try {
      await api.transportCards.delete(id)
      setCards(cards.filter((c) => c.id !== id))
    } catch (error) {
      alert('Ошибка при удалении: ' + (error as Error).message)
    }
  }

  const columns: ColumnDef<typeof cards[0]>[] = [
    {
      accessorKey: 'cardNumber',
      header: 'Номер карты',
      cell: ({ row }) => (
        <button
          onClick={() =>
            navigate({
              to: '/transport-cards/$cardId',
              params: { cardId: String(row.original.id) },
            })
          }
          className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border bg-background hover:bg-muted/50 transition-colors shadow-sm text-sm"
        >
          <span className="font-medium">{row.getValue('cardNumber')}</span>
        </button>
      ),
    },
    {
      accessorKey: 'driver',
      header: 'Водитель',
      cell: ({ row }) => {
        const driver = row.original.driver
        return driver ? (
          <span className="text-sm">
            {driver.lastName} {driver.firstName} {driver.middleName}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Не назначен</span>
        )
      },
    },
    {
      accessorKey: 'totalExpenses',
      header: 'Общие расходы',
      cell: ({ getValue }) => `${getValue<number>()} ₽`,
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
                to: '/transport-cards/$cardId',
                params: { cardId: String(row.original.id) },
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
          <CardTitle>Транспортные карты</CardTitle>
          <Link to="/transport-cards/new">
            <Button>Добавить карту</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Загрузка...
          </div>
        ) : (
          <DataTable columns={columns} data={cards} />
        )}
      </CardContent>
    </Card>
  )
}
