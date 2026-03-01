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
import type { Role } from '@/lib/types'

const roleSchema = z.object({
  code: z.string().min(1, 'Код роли обязателен').max(50).optional(),
  name: z.string().min(1, 'Название роли обязательно').max(100).optional(),
})

type RoleForm = z.infer<typeof roleSchema>

export const Route = createFileRoute('/roles/$roleId')({
  component: EditRolePage,
})

function EditRolePage() {
  const { roleId } = useParams({ from: '/roles/$roleId' })
  const navigate = useNavigate()
  const [role, setRole] = React.useState<Role | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
  })

  React.useEffect(() => {
    api.roles.get(Number(roleId))
      .then((data) => {
        setRole(data)
        setValue('code', data.code)
        setValue('name', data.name)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [roleId, setValue])

  const onSubmit = async (data: RoleForm) => {
    setError(null)
    setIsSubmitting(true)
    try {
      const updateData: Record<string, unknown> = {}
      if (data.code) updateData.code = data.code
      if (data.name) updateData.name = data.name

      await api.roles.update(Number(roleId), updateData)
      navigate({ to: '/roles' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту роль?')) {
      return
    }

    setIsDeleting(true)
    try {
      await api.roles.delete(Number(roleId))
      navigate({ to: '/roles' })
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

  if (!role) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Роль не найдена
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Редактирование роли</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {role.name} ({role.code})
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
            <Label htmlFor="code">Код роли</Label>
            <Input
              id="code"
              disabled={isSubmitting}
              {...register('code')}
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              disabled={isSubmitting}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
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
