import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoleDetailPage } from "./hooks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";

export const EditRolePage = () => {
  const navigate = useNavigate();
  const { isLoading, role, handleDelete, isDeleting, form, onSubmit, error, isSubmitting } =
    useRoleDetailPage();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Загрузка...</CardContent>
      </Card>
    );
  }

  if (!role) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Роль не найдена
        </CardContent>
      </Card>
    );
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
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Удаление..." : "Удалить"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Код роли</Label>
            <Input id="code" disabled={isSubmitting} {...form.register("code")} />
            {form.formState.errors.code && (
              <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Название</Label>
            <Input id="name" disabled={isSubmitting} {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/roles" })}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
