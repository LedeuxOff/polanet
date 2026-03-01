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

const clientSchema = z.object({
  type: z.enum(['individual', 'legal']),
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
  if (data.type === 'individual') {
    if (!data.lastName || data.lastName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Фамилия обязательна для физического лица',
        path: ['lastName'],
      })
    }
    if (!data.firstName || data.firstName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Имя обязательно для физического лица',
        path: ['firstName'],
      })
    }
  } else if (data.type === 'legal') {
    if (!data.organizationName || data.organizationName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Название организации обязательно для юридического лица',
        path: ['organizationName'],
      })
    }
  }
})

type ClientForm = z.infer<typeof clientSchema>

export const Route = createFileRoute('/clients/new')({
  component: NewClientPage,
})

function NewClientPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [clientType, setClientType] = React.useState<'individual' | 'legal'>('individual')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      type: 'individual',
    },
  })

  const onSubmit = async (data: ClientForm) => {
    setError(null)
    setIsSubmitting(true)
    try {
      await api.clients.create(data)
      navigate({ to: '/clients' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новый клиент</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="type">Тип клиента *</Label>
            <Select
              value={clientType}
              onValueChange={(value: 'individual' | 'legal') => {
                setClientType(value)
                setValue('type', value)
                // Сбрасываем поля при смене типа
                if (value === 'individual') {
                  setValue('organizationName', undefined)
                } else {
                  setValue('lastName', undefined)
                  setValue('firstName', undefined)
                  setValue('middleName', undefined)
                }
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
                  <Label htmlFor="lastName">Фамилия *</Label>
                  <Input
                    id="lastName"
                    placeholder="Иванов"
                    disabled={isSubmitting}
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя *</Label>
                  <Input
                    id="firstName"
                    placeholder="Иван"
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
                    placeholder="Иванович"
                    disabled={isSubmitting}
                    {...register('middleName')}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="organizationName">Название организации *</Label>
              <Input
                id="organizationName"
                placeholder='ООО "Ромашка"'
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
                placeholder="+7 (999) 000-00-00"
                disabled={isSubmitting}
                {...register('phone')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
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
              {isSubmitting ? 'Создание...' : 'Создать'}
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
