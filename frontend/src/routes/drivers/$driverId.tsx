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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { api } from '@/lib/api'
import type { Driver, TransportCard } from '@/lib/types'

const driverSchema = z.object({
  lastName: z.string().min(1, 'Фамилия обязательна').optional(),
  firstName: z.string().min(1, 'Имя обязательно').optional(),
  middleName: z.string().optional(),
  phone: z.string().optional(),
})

type DriverForm = z.infer<typeof driverSchema>

export const Route = createFileRoute('/drivers/$driverId')({
  component: EditDriverPage,
})

function EditDriverPage() {
  const { driverId } = useParams({ from: '/drivers/$driverId' })
  const navigate = useNavigate()
  const [driver, setDriver] = React.useState<Driver | null>(null)
  const [transportCards, setTransportCards] = React.useState<TransportCard[]>([])
  const [selectedCardId, setSelectedCardId] = React.useState<string>('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showUnbindDialog, setShowUnbindDialog] = React.useState(false)
  const [isUnbinding, setIsUnbinding] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DriverForm>({
    resolver: zodResolver(driverSchema),
  })

  React.useEffect(() => {
    Promise.all([
      api.drivers.get(Number(driverId))
        .then((data) => {
          setDriver(data)
          setValue('lastName', data.lastName)
          setValue('firstName', data.firstName)
          setValue('middleName', data.middleName || '')
          setValue('phone', data.phone || '')
          // Устанавливаем выбранную карту
          if (data.transportCard) {
            setSelectedCardId(String(data.transportCard.id))
          }
        })
        .catch(console.error),
      api.transportCards.list()
        .then((cards) => {
          // Фильтруем карты которые не привязаны к водителю или привязаны к текущему
          const availableCards = cards.filter(
            (c) => !c.driverId || c.driverId === Number(driverId)
          )
          setTransportCards(availableCards)
        })
        .catch(console.error),
    ]).finally(() => setIsLoading(false))
  }, [driverId, setValue])

  const onSubmit = async (data: DriverForm) => {
    setError(null)
    setIsSubmitting(true)
    try {
      // Сначала обновляем данные водителя
      const updateData: Record<string, unknown> = {}
      if (data.lastName) updateData.lastName = data.lastName
      if (data.firstName) updateData.firstName = data.firstName
      if (data.middleName !== undefined) updateData.middleName = data.middleName
      if (data.phone !== undefined) updateData.phone = data.phone

      await api.drivers.update(Number(driverId), updateData)

      // Затем обновляем привязку карты
      const newCardId = selectedCardId ? Number(selectedCardId) : null
      
      // Если была карта и выбрали другую - отвязываем старую
      if (driver?.transportCard && newCardId && newCardId !== driver.transportCard.id) {
        await api.transportCards.update(driver.transportCard.id, { driverId: null })
      }
      
      // Если выбрали новую карту - привязываем
      if (newCardId && (!driver?.transportCard || driver.transportCard.id !== newCardId)) {
        await api.transportCards.update(newCardId, { driverId: Number(driverId) })
      }
      
      // Если отвязали карту (была, стало null)
      if (!newCardId && driver?.transportCard) {
        await api.transportCards.update(driver.transportCard.id, { driverId: null })
      }

      navigate({ to: '/drivers' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUnbindCard = async () => {
    if (!driver?.transportCard) return
    
    setIsUnbinding(true)
    setError(null)
    try {
      await api.transportCards.update(driver.transportCard.id, { driverId: null })
      setShowUnbindDialog(false)
      // Обновляем данные
      const updated = await api.drivers.get(Number(driverId))
      setDriver(updated)
      setSelectedCardId('')
      
      // Обновляем список карт
      const cards = await api.transportCards.list()
      const availableCards = cards.filter(
        (c) => !c.driverId || c.driverId === Number(driverId)
      )
      setTransportCards(availableCards)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при отвязке карты')
    } finally {
      setIsUnbinding(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этого водителя?')) {
      return
    }

    setIsDeleting(true)
    try {
      await api.drivers.delete(Number(driverId))
      navigate({ to: '/drivers' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении')
    } finally {
      setIsDeleting(false)
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

  if (!driver) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Водитель не найден
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Редактирование водителя</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {driver.lastName} {driver.firstName} {driver.middleName}
              </p>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  disabled={isSubmitting}
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  disabled={isSubmitting}
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="middleName">Отчество</Label>
                <Input
                  id="middleName"
                  disabled={isSubmitting}
                  {...register('middleName')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  disabled={isSubmitting}
                  {...register('phone')}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/drivers' })}
              >
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Транспортная карта */}
      <Card>
        <CardHeader>
          <CardTitle>Транспортная карта</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {driver.transportCard ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{driver.transportCard.cardNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    Общие расходы: {driver.transportCard.totalExpenses} ₽
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate({ to: '/transport-cards/$cardId', params: { cardId: String(driver.transportCard!.id) } })}
                >
                  Открыть
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Для отвязки карты нажмите кнопку ниже
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowUnbindDialog(true)}
                  disabled={isUnbinding}
                >
                  {isUnbinding ? 'Отвязка...' : 'Отвязать карту'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Привязать транспортную карту</Label>
              <Select
                value={selectedCardId}
                onValueChange={setSelectedCardId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите карту" />
                </SelectTrigger>
                <SelectContent>
                  {transportCards.length === 0 ? (
                    <SelectItem value="" disabled>Нет доступных карт</SelectItem>
                  ) : (
                    transportCards.map((card) => (
                      <SelectItem key={card.id} value={String(card.id)}>
                        {card.cardNumber}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Карта будет привязана после нажатия кнопки "Сохранить"
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модальное окно подтверждения отвязки */}
      <Dialog open={showUnbindDialog} onOpenChange={setShowUnbindDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отвязать транспортную карту</DialogTitle>
            <DialogDescription>
              Вы уверены что хотите отвязать карту {driver?.transportCard?.cardNumber}? 
              Это действие можно будет отменить позже.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUnbindDialog(false)}
              disabled={isUnbinding}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnbindCard}
              disabled={isUnbinding}
            >
              {isUnbinding ? 'Отвязка...' : 'Отвязать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
