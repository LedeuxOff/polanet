import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import type { Car } from '@/lib/types'

const carSchema = z.object({
  brand: z.string().min(1, 'Марка автомобиля обязательна').optional(),
  licensePlate: z.string().min(1, 'Гос номер обязателен').optional(),
})

type CarForm = z.infer<typeof carSchema>

export const Route = createFileRoute('/cars/$carId')({
  component: EditCarPage,
})

function EditCarPage() {
  const { carId } = useParams({ from: '/cars/$carId' })
  const navigate = useNavigate()
  const [car, setCar] = React.useState<Car | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CarForm>({
    resolver: zodResolver(carSchema),
  })

  React.useEffect(() => {
    api.cars.get(Number(carId))
      .then((data) => {
        setCar(data)
        setValue('brand', data.brand)
        setValue('licensePlate', data.licensePlate)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [carId, setValue])

  const onSubmit = async (data: CarForm) => {
    setError(null)
    setIsSubmitting(true)
    try {
      const updateData: Record<string, unknown> = {}
      if (data.brand) updateData.brand = data.brand
      if (data.licensePlate) updateData.licensePlate = data.licensePlate

      await api.cars.update(Number(carId), updateData)
      navigate({ to: '/cars' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      return
    }

    setIsDeleting(true)
    try {
      await api.cars.delete(Number(carId))
      navigate({ to: '/cars' })
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

  if (!car) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Автомобиль не найден
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Редактирование автомобиля</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {car.brand} ({car.licensePlate})
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

          <div className="space-y-2">
            <Label htmlFor="brand">Марка</Label>
            <Input
              id="brand"
              disabled={isSubmitting}
              {...register('brand')}
            />
            {errors.brand && (
              <p className="text-sm text-destructive">{errors.brand.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licensePlate">Гос номер</Label>
            <Input
              id="licensePlate"
              disabled={isSubmitting}
              {...register('licensePlate')}
            />
            {errors.licensePlate && (
              <p className="text-sm text-destructive">{errors.licensePlate.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
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
