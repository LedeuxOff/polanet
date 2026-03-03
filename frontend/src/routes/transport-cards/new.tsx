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
import { api } from '@/lib/api'
import type { Driver } from '@/lib/types'

const transportCardSchema = z.object({
  cardNumber: z.string().min(1, 'Номер карты обязателен'),
  driverId: z.coerce.number().optional().nullable(),
})

type TransportCardForm = z.infer<typeof transportCardSchema>

export const Route = createFileRoute('/transport-cards/new')({
  component: NewTransportCardPage,
})

function NewTransportCardPage() {
  const navigate = useNavigate()
  const [drivers, setDrivers] = React.useState<Driver[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

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
  }, [])

  const onSubmit = async (data: TransportCardForm) => {
    setError(null)
    setIsSubmitting(true)
    try {
      await api.transportCards.create(data)
      navigate({ to: '/transport-cards' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новая транспортная карта</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Номер карты *</Label>
            <Input
              id="cardNumber"
              placeholder="12345678"
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
              {isSubmitting ? 'Создание...' : 'Создать'}
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
  )
}
