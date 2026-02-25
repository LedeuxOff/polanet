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
import type { Role, User } from '@/lib/types'

const userSchema = z.object({
  lastName: z.string().min(1, 'Фамилия обязательна').optional(),
  firstName: z.string().min(1, 'Имя обязательно').optional(),
  middleName: z.string().optional(),
  birthDate: z.string().optional(),
  email: z.string().email('Неверный формат email').optional(),
  phone: z.string().optional(),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов').optional(),
  roleId: z.coerce.number().int().positive('Роль обязательна').optional(),
})

type UserForm = z.infer<typeof userSchema>

export const Route = createFileRoute('/users/$userId')({
  component: EditUserPage,
})

function EditUserPage() {
  const { userId } = useParams({ from: '/users/$userId' })
  const navigate = useNavigate()
  const [user, setUser] = React.useState<User | null>(null)
  const [roles, setRoles] = React.useState<Role[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
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
    Promise.all([
      api.users.get(Number(userId)).then(setUser).catch(console.error),
      api.roles.list().then(setRoles).catch(console.error),
    ]).finally(() => setIsLoading(false))
  }, [userId])

  React.useEffect(() => {
    if (user) {
      setValue('lastName', user.lastName)
      setValue('firstName', user.firstName)
      setValue('middleName', user.middleName || '')
      setValue('birthDate', user.birthDate || '')
      setValue('email', user.email)
      setValue('phone', user.phone || '')
      setValue('roleId', user.roleId)
    }
  }, [user, setValue])

  const onSubmit = async (data: UserForm) => {
    setError(null)
    setIsSubmitting(true)
    try {
      const updateData: Record<string, unknown> = {}
      if (data.lastName) updateData.lastName = data.lastName
      if (data.firstName) updateData.firstName = data.firstName
      if (data.middleName !== undefined) updateData.middleName = data.middleName
      if (data.birthDate !== undefined) updateData.birthDate = data.birthDate
      if (data.email) updateData.email = data.email
      if (data.phone !== undefined) updateData.phone = data.phone
      if (data.password) updateData.password = data.password
      if (data.roleId) updateData.roleId = data.roleId

      await api.users.update(Number(userId), updateData)
      navigate({ to: '/users' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении')
    } finally {
      setIsSubmitting(false)
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

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Пользователь не найден
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Редактирование пользователя</CardTitle>
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
              <Label htmlFor="lastName">Фамилия</Label>
              <Input id="lastName" disabled={isSubmitting} {...register('lastName')} />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">Имя</Label>
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
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="roleId">Роль</Label>
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
            <Label htmlFor="password">Новый пароль (оставьте пустым, чтобы не менять)</Label>
            <Input id="password" type="password" disabled={isSubmitting} {...register('password')} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
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
