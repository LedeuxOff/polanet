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
import type { Driver } from '@/lib/types'

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
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<DriverForm>({
    resolver: zodResolver(driverSchema),
  })

  React.useEffect(() => {
    api.drivers.get(Number(driverId))
      .then((data) => {
        setDriver(data)
        setValue('lastName', data.lastName)
        setValue('firstName', data.firstName)
        setValue('middleName', data.middleName || '')
        setValue('phone', data.phone || '')
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [driverId, setValue])

  const onSubmit = async (data: DriverForm) => {
    setError(null)
    setIsSubmitting(true)
    try {
      const updateData: Record<string, unknown> = {}
      if (data.lastName) updateData.lastName = data.lastName
      if (data.firstName) updateData.firstName = data.firstName
      if (data.middleName !== undefined) updateData.middleName = data.middleName
      if (data.phone !== undefined) updateData.phone = data.phone

      await api.drivers.update(Number(driverId), updateData)
      navigate({ to: '/drivers' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении')
    } finally {
      setIsSubmitting(false)
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
  )
}
