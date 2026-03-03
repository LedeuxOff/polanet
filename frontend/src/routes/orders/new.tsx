import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import type { Client, Driver, Car } from '@/lib/types'

const orderSchema = z.object({
  type: z.enum(['delivery', 'pickup']),
  address: z.string().min(1, 'Адрес обязателен'),
  cost: z.coerce.number().int().positive('Стоимость должна быть положительной'),
  payerLastName: z.string().min(1, 'Фамилия плательщика обязательна'),
  payerFirstName: z.string().min(1, 'Имя плательщика обязательно'),
  payerMiddleName: z.string().optional(),
  receiverLastName: z.string().min(1, 'Фамилия приемщика обязательна'),
  receiverFirstName: z.string().min(1, 'Имя приемщика обязательно'),
  receiverMiddleName: z.string().optional(),
  dateTime: z.string().min(1, 'Дата и время обязательны'),
  hasPass: z.boolean().default(false),
  addressComment: z.string().optional(),
  status: z.enum(['new', 'in_progress', 'completed', 'cancelled', 'archived', 'draft']),
  paymentType: z.enum(['cash', 'bank_transfer']),
  clientId: z.coerce.number().optional().nullable(),
  driverId: z.coerce.number().optional().nullable(),
  carId: z.coerce.number().optional().nullable(),
})

type OrderForm = z.infer<typeof orderSchema>

export const Route = createFileRoute('/orders/new')({
  component: NewOrderPage,
})

function NewOrderPage() {
  const navigate = useNavigate()
  const [clients, setClients] = React.useState<Client[]>([])
  const [drivers, setDrivers] = React.useState<Driver[]>([])
  const [cars, setCars] = React.useState<Car[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      status: 'draft',
      hasPass: false,
    },
  })

  React.useEffect(() => {
    Promise.all([
      api.clients.list().then(setClients).catch(console.error),
      api.drivers.list().then(setDrivers).catch(console.error),
      api.cars.list().then(setCars).catch(console.error),
    ]).catch(console.error)
  }, [])

  const onSubmit = async (data: OrderForm) => {
    setError(null)
    setIsSubmitting(true)
    try {
      await api.orders.create(data)
      navigate({ to: '/orders' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новая заявка</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          {/* Тип и статус */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Тип заявки *</Label>
              <Select
                value={watch('type')}
                onValueChange={(value: 'delivery' | 'pickup') => setValue('type', value)}
              >
                <SelectTrigger disabled={isSubmitting}>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Доставка</SelectItem>
                  <SelectItem value="pickup">Вывоз</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Статус *</Label>
              <Select
                value={watch('status')}
                onValueChange={(value: 'new' | 'in_progress' | 'completed' | 'cancelled' | 'archived' | 'draft') => setValue('status', value)}
              >
                <SelectTrigger disabled={isSubmitting}>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Черновик</SelectItem>
                  <SelectItem value="new">Новая</SelectItem>
                  <SelectItem value="in_progress">Выполняется</SelectItem>
                  <SelectItem value="completed">Завершено</SelectItem>
                  <SelectItem value="cancelled">Отменено</SelectItem>
                  <SelectItem value="archived">Архив</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Адрес и стоимость */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Адрес *</Label>
              <Textarea
                id="address"
                disabled={isSubmitting}
                {...register('address')}
                rows={2}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Стоимость (₽) *</Label>
              <Input
                id="cost"
                type="number"
                disabled={isSubmitting}
                {...register('cost')}
              />
              {errors.cost && (
                <p className="text-sm text-destructive">{errors.cost.message}</p>
              )}
            </div>
          </div>

          {/* Плательщик */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Плательщик</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payerLastName">Фамилия *</Label>
                <Input
                  id="payerLastName"
                  disabled={isSubmitting}
                  {...register('payerLastName')}
                />
                {errors.payerLastName && (
                  <p className="text-sm text-destructive">{errors.payerLastName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payerFirstName">Имя *</Label>
                <Input
                  id="payerFirstName"
                  disabled={isSubmitting}
                  {...register('payerFirstName')}
                />
                {errors.payerFirstName && (
                  <p className="text-sm text-destructive">{errors.payerFirstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payerMiddleName">Отчество</Label>
                <Input
                  id="payerMiddleName"
                  disabled={isSubmitting}
                  {...register('payerMiddleName')}
                />
              </div>
            </div>
          </div>

          {/* Приемщик */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Приемщик</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receiverLastName">Фамилия *</Label>
                <Input
                  id="receiverLastName"
                  disabled={isSubmitting}
                  {...register('receiverLastName')}
                />
                {errors.receiverLastName && (
                  <p className="text-sm text-destructive">{errors.receiverLastName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiverFirstName">Имя *</Label>
                <Input
                  id="receiverFirstName"
                  disabled={isSubmitting}
                  {...register('receiverFirstName')}
                />
                {errors.receiverFirstName && (
                  <p className="text-sm text-destructive">{errors.receiverFirstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiverMiddleName">Отчество</Label>
                <Input
                  id="receiverMiddleName"
                  disabled={isSubmitting}
                  {...register('receiverMiddleName')}
                />
              </div>
            </div>
          </div>

          {/* Дата и время */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateTime">Дата и время *</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                disabled={isSubmitting}
                {...register('dateTime')}
              />
              {errors.dateTime && (
                <p className="text-sm text-destructive">{errors.dateTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentType">Тип оплаты *</Label>
              <Select
                value={watch('paymentType')}
                onValueChange={(value: 'cash' | 'bank_transfer') => setValue('paymentType', value)}
              >
                <SelectTrigger disabled={isSubmitting}>
                  <SelectValue placeholder="Выберите тип оплаты" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Наличные</SelectItem>
                  <SelectItem value="bank_transfer">Безналичный расчет</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentType && (
                <p className="text-sm text-destructive">{errors.paymentType.message}</p>
              )}
            </div>
          </div>

          {/* Пропуск и комментарий */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  disabled={isSubmitting}
                  {...register('hasPass')}
                  className="h-4 w-4"
                />
                Наличие пропуска
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressComment">Комментарий к адресу</Label>
              <Textarea
                id="addressComment"
                disabled={isSubmitting}
                {...register('addressComment')}
                rows={2}
              />
            </div>
          </div>

          {/* Связи */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Исполнители</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Клиент</Label>
                <Select
                  value={String(watch('clientId') || '')}
                  onValueChange={(value) => setValue('clientId', value ? Number(value) : null)}
                >
                  <SelectTrigger disabled={isSubmitting}>
                    <SelectValue placeholder="Не выбран" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.type === 'individual'
                          ? `${client.lastName} ${client.firstName}`
                          : client.organizationName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="driverId">Водитель</Label>
                <Select
                  value={String(watch('driverId') || '')}
                  onValueChange={(value) => setValue('driverId', value ? Number(value) : null)}
                >
                  <SelectTrigger disabled={isSubmitting}>
                    <SelectValue placeholder="Не выбран" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={String(driver.id)}>
                        {driver.lastName} {driver.firstName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carId">Автомобиль</Label>
                <Select
                  value={String(watch('carId') || '')}
                  onValueChange={(value) => setValue('carId', value ? Number(value) : null)}
                >
                  <SelectTrigger disabled={isSubmitting}>
                    <SelectValue placeholder="Не выбран" />
                  </SelectTrigger>
                  <SelectContent>
                    {cars.map((car) => (
                      <SelectItem key={car.id} value={String(car.id)}>
                        {car.brand} ({car.licensePlate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Создание...' : 'Создать'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/orders' })}
            >
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
