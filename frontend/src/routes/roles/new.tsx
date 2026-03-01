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

const roleSchema = z.object({
  code: z.string().min(1, 'Код роли обязателен').max(50),
  name: z.string().min(1, 'Название роли обязательно').max(100),
})

type RoleForm = z.infer<typeof roleSchema>

export const Route = createFileRoute('/roles/new')({
  component: NewRolePage,
})

function NewRolePage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
  })

  const onSubmit = async (data: RoleForm) => {
    setError(null)
    setIsSubmitting(true)
    try {
      await api.roles.create(data)
      navigate({ to: '/roles' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новая роль</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Код роли *</Label>
            <Input
              id="code"
              placeholder="ADMIN"
              disabled={isSubmitting}
              {...register('code')}
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Название *</Label>
            <Input
              id="name"
              placeholder="Администратор"
              disabled={isSubmitting}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Создание...' : 'Создать'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/roles' })}
            >
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
