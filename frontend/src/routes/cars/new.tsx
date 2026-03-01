import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'

const carSchema = z.object({
  brand: z.string().min(1, 'Марка автомобиля обязательна'),
  licensePlate: z.string().min(1, 'Гос номер обязателен'),
})

type CarForm = z.infer<typeof carSchema>

export const Route = createFileRoute('/cars/new')({
  component: NewCarPage,
})

function NewCarPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CarForm>({
    resolver: zodResolver(carSchema),
  })

  const onSubmit = async (data: CarForm) => {
    setError(null)
    setIsSubmitting(true)
    try {
      await api.cars.create(data)
      navigate({ to: '/cars' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новый автомобиль</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="brand">Марка *</Label>
            <Input
              id="brand"
              placeholder="Toyota"
              disabled={isSubmitting}
              {...register('brand')}
            />
            {errors.brand && (
              <p className="text-sm text-destructive">{errors.brand.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licensePlate">Гос номер *</Label>
            <Input
              id="licensePlate"
              placeholder="А 000 АА 777"
              disabled={isSubmitting}
              {...register('licensePlate')}
            />
            {errors.licensePlate && (
              <p className="text-sm text-destructive">{errors.licensePlate.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Создание...' : 'Создать'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/cars' })}
            >
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
