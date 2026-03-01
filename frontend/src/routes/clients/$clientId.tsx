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
import { api } from '@/lib/api'
import type { Client } from '@/lib/types'

const clientSchema = z.object({
  type: z.enum(['individual', 'legal']).optional(),
  // Для физического лица
  lastName: z.string().min(1, 'Фамилия обязательна').optional(),
  firstName: z.string().min(1, 'Имя обязательно').optional(),
  middleName: z.string().optional(),
  // Для юридического лица
  organizationName: z.string().min(1, 'Название организации обязательно').optional(),
  // Общие поля
  phone: z.string().optional(),
  email: z.string().email('Неверный формат email').optional(),
}).superRefine((data, ctx) => {
  // На странице редактирования проверяем только если тип individual и поля пустые
  if (data.type === 'individual') {
    if (data.lastName === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Фамилия обязательна для физического лица',
        path: ['lastName'],
      })
    }
    if (data.firstName === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Имя обязательно для физического лица',
        path: ['firstName'],
      })
    }
  } else if (data.type === 'legal') {
    if (data.organizationName === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Название организации обязательно для юридического лица',
        path: ['organizationName'],
      })
    }
  }
})

type ClientForm = z.infer<typeof clientSchema>

export const Route = createFileRoute('/clients/$clientId')({
  component: EditClientPage,
})

function EditClientPage() {
  const { clientId } = useParams({ from: '/clients/$clientId' })
  const navigate = useNavigate()
  const [client, setClient] = React.useState<Client | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [clientType, setClientType] = React.useState<'individual' | 'legal'>('individual')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
  })

  React.useEffect(() => {
    api.clients.get(Number(clientId))
      .then((data) => {
        setClient(data)
        setClientType(data.type)
        setValue('type', data.type)
        setValue('lastName', data.lastName || '')
        setValue('firstName', data.firstName || '')
        setValue('middleName', data.middleName || '')
        setValue('organizationName', data.organizationName || '')
        setValue('phone', data.phone || '')
        setValue('email', data.email || '')
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [clientId, setValue])

  const onSubmit = async (data: ClientForm) => {
    setError(null)
    setIsSubmitting(true)
    try {
      const updateData: Record<string, unknown> = {}
      if (data.type) updateData.type = data.type
      if (data.lastName !== undefined) updateData.lastName = data.lastName
      if (data.firstName !== undefined) updateData.firstName = data.firstName
      if (data.middleName !== undefined) updateData.middleName = data.middleName
      if (data.organizationName !== undefined) updateData.organizationName = data.organizationName
      if (data.phone !== undefined) updateData.phone = data.phone
      if (data.email !== undefined) updateData.email = data.email

      await api.clients.update(Number(clientId), updateData)
      navigate({ to: '/clients' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этого клиента?')) {
      return
    }

    setIsDeleting(true)
    try {
      await api.clients.delete(Number(clientId))
      navigate({ to: '/clients' })
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

  if (!client) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Клиент не найден
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Редактирование клиента</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {client.type === 'individual'
                ? `${client.lastName} ${client.firstName} ${client.middleName || ''}`.trim()
                : client.organizationName}
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
            <Label htmlFor="type">Тип клиента</Label>
            <Select
              value={clientType}
              onValueChange={(value: 'individual' | 'legal') => {
                setClientType(value)
                setValue('type', value)
              }}
            >
              <SelectTrigger disabled={isSubmitting}>
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Физическое лицо</SelectItem>
                <SelectItem value="legal">Юридическое лицо</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {clientType === 'individual' ? (
            <>
              <div className="grid grid-cols-3 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="middleName">Отчество</Label>
                  <Input
                    id="middleName"
                    disabled={isSubmitting}
                    {...register('middleName')}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="organizationName">Название организации</Label>
              <Input
                id="organizationName"
                disabled={isSubmitting}
                {...register('organizationName')}
              />
              {errors.organizationName && (
                <p className="text-sm text-destructive">{errors.organizationName.message}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                disabled={isSubmitting}
                {...register('phone')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                disabled={isSubmitting}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/clients' })}
            >
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
