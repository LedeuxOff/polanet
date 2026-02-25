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
import type { Role } from '@/lib/types'

const userSchema = z.object({
  lastName: z.string().min(1, 'Фамилия обязательна'),
  firstName: z.string().min(1, 'Имя обязательно'),
  middleName: z.string().optional(),
  birthDate: z.string().optional(),
  email: z.string().email('Неверный формат email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
  roleId: z.coerce.number().int().positive('Роль обязательна'),
})

type UserForm = z.infer<typeof userSchema>

export const Route = createFileRoute('/users/new')({
  component: NewUserPage,
})

function NewUserPage() {
  const navigate = useNavigate()
  const [roles, setRoles] = React.useState<Role[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  })

  React.useEffect(() => {
    api.roles.list().then(setRoles).catch(console.error)
  }, [])

  const onSubmit = async (data: UserForm) => {
    setError(null)
    setIsSubmitting(true)
    try {
      await api.users.create(data)
      navigate({ to: '/users' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новый пользователь</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName">Фамилия *</Label>
              <Input id="lastName" disabled={isSubmitting} {...register('lastName')} />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">Имя *</Label>
              <Input id="firstName" disabled={isSubmitting} {...register('firstName')} />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleName">Отчество</Label>
              <Input id="middleName" disabled={isSubmitting} {...register('middleName')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" disabled={isSubmitting} {...register('email')} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" disabled={isSubmitting} {...register('phone')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Дата рождения</Label>
              <Input id="birthDate" type="date" disabled={isSubmitting} {...register('birthDate')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleId">Роль *</Label>
              <Select
                value={String(watch('roleId') || '')}
                onValueChange={(value) => setValue('roleId', Number(value))}
              >
                <SelectTrigger disabled={isSubmitting}>
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleId && (
                <p className="text-sm text-destructive">{errors.roleId.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль *</Label>
            <Input id="password" type="password" disabled={isSubmitting} {...register('password')} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Создание...' : 'Создать'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate({ to: '/users' })}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
