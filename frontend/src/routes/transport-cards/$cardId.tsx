import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import type { TransportCard, Driver, TransportCardExpense, TransportCardHistory } from '@/lib/types'

const transportCardSchema = z.object({
  cardNumber: z.string().min(1, 'Номер карты обязателен').optional(),
  driverId: z.coerce.number().optional().nullable(),
})

type TransportCardForm = z.infer<typeof transportCardSchema>

export const Route = createFileRoute('/transport-cards/$cardId')({
  component: TransportCardDetailPage,
})

function TransportCardDetailPage() {
  const { cardId } = useParams({ from: '/transport-cards/$cardId' })
  const navigate = useNavigate()
  
  const [card, setCard] = React.useState<TransportCard | null>(null)
  const [drivers, setDrivers] = React.useState<Driver[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  
  // Расходы
  const [expenseAmount, setExpenseAmount] = React.useState('')
  const [expenseDate, setExpenseDate] = React.useState(new Date().toISOString().split('T')[0])
  const [isAddingExpense, setIsAddingExpense] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TransportCardForm>({
    resolver: zodResolver(transportCardSchema),
  })

  React.useEffect(() => {
    api.drivers.list().then(setDrivers).catch(console.error)

    api.transportCards.get(Number(cardId))
      .then((data) => {
        setCard(data)
        setValue('cardNumber', data.cardNumber)
        setValue('driverId', data.driverId)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [cardId, setValue])

  const onSubmit = async (data: TransportCardForm) => {
    setError(null)
    setIsSubmitting(true)
    try {
      await api.transportCards.update(Number(cardId), data)
      navigate({ to: '/transport-cards' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту транспортную карту?')) {
      return
    }

    setIsDeleting(true)
    try {
      await api.transportCards.delete(Number(cardId))
      navigate({ to: '/transport-cards' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddExpense = async () => {
    if (!expenseAmount || !expenseDate) {
      setError('Укажите сумму и дату расхода')
      return
    }

    setIsAddingExpense(true)
    try {
      await api.transportCards.addExpense(Number(cardId), {
        cardId: Number(cardId),
        amount: Number(expenseAmount),
        paymentDate: expenseDate,
      })
      setExpenseAmount('')
      const updated = await api.transportCards.get(Number(cardId))
      setCard(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при добавлении расхода')
    } finally {
      setIsAddingExpense(false)
    }
  }

  const handleRemoveExpense = async (expenseId: number) => {
    if (!confirm('Удалить этот расход?')) {
      return
    }

    try {
      await api.transportCards.removeExpense(Number(cardId), expenseId)
      const updated = await api.transportCards.get(Number(cardId))
      setCard(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении расхода')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Загрузка...
        </CardContent>
      </Card>
    )
  }

  const totalExpenses = card?.totalExpenses || 0

  return (
    <div className="space-y-6">
      {/* Основная форма */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Транспортная карта #{cardId}</CardTitle>
              {card && (
                <p className="text-sm text-muted-foreground mt-1">
                  {card.cardNumber}
                </p>
              )}
            </div>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Номер карты</Label>
              <Input
                id="cardNumber"
                disabled={isSubmitting}
                {...register('cardNumber')}
              />
              {errors.cardNumber && (
                <p className="text-sm text-destructive">{errors.cardNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="driverId">Водитель</Label>
              <Select
                value={String(watch('driverId') || '')}
                onValueChange={(value) => setValue('driverId', value ? Number(value) : null)}
              >
                <SelectTrigger disabled={isSubmitting}>
                  <SelectValue placeholder="Не назначен" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={String(driver.id)}>
                      {driver.lastName} {driver.firstName} {driver.middleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/transport-cards' })}
              >
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Блок расходов и истории */}
      {card && (
        <>
          {/* Финансы */}
          <Card>
            <CardHeader>
              <CardTitle>Расходы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Общая сумма расходов</p>
                <p className="text-2xl font-bold text-destructive">{totalExpenses} ₽</p>
              </div>

              <Separator />

              {/* Добавление расхода */}
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="expenseAmount">Сумма расхода</Label>
                  <Input
                    id="expenseAmount"
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="1000"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="expenseDate">Дата оплаты</Label>
                  <Input
                    id="expenseDate"
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleAddExpense}
                  disabled={isAddingExpense || !expenseAmount}
                >
                  {isAddingExpense ? 'Добавление...' : 'Добавить расход'}
                </Button>
              </div>

              {/* История расходов */}
              {card.expenses && card.expenses.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">История расходов</h4>
                  <div className="space-y-2">
                    {card.expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div>
                          <p className="font-medium">{expense.amount} ₽</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(expense.paymentDate).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExpense(expense.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* История изменений */}
          {card.history && card.history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>История изменений</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {card.history.map((item) => {
                    const userName = [
                      item.userLastName,
                      item.userFirstName && item.userFirstName.charAt(0) + '.',
                      item.userMiddleName && item.userMiddleName.charAt(0) + '.',
                    ].filter(Boolean).join(' ')

                    return (
                      <div
                        key={item.id}
                        className="p-3 border rounded-md bg-muted/50"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              item.action === 'created' ? 'default' :
                              item.action === 'driver_assigned' || item.action === 'driver_unassigned' ? 'secondary' :
                              'outline'
                            }>
                              {item.action === 'created' && 'Создана'}
                              {item.action === 'updated' && 'Изменена'}
                              {item.action === 'deleted' && 'Удалена'}
                              {item.action === 'expense_added' && 'Расход добавлен'}
                              {item.action === 'expense_removed' && 'Расход удален'}
                              {item.action === 'driver_assigned' && 'Водитель назначен'}
                              {item.action === 'driver_unassigned' && 'Водитель откреплен'}
                            </Badge>
                            {userName && (
                              <span className="text-sm font-medium">{userName}</span>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString('ru-RU')}
                          </span>
                        </div>
                        {item.fieldName && (
                          <p className="text-sm">
                            <span className="font-medium">{item.fieldName}:</span>{' '}
                            {item.oldValue && <span className="text-muted-foreground line-through">{item.oldValue}</span>}
                            {item.oldValue && item.newValue && ' → '}
                            {item.newValue && <span className="font-medium">{item.newValue}</span>}
                          </p>
                        )}
                        {item.newValue && !item.fieldName && (
                          <p className="text-sm">{item.newValue}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
