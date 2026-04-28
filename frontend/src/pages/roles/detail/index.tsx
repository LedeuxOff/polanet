import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoleDetailPage } from "./hooks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, TrashIcon } from "lucide-react";

export const EditRolePage = () => {
  const navigate = useNavigate();
  const { isLoading, role, handleDelete, isDeleting, form, onSubmit, isSubmitting } =
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
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Роли</CardTitle>

            <div className="flex items-center gap-2">
              <Link to="/roles" className="text-sm text-muted-foreground">
                Список ролей
              </Link>

              <span className="text-sm text-muted-foreground">/</span>

              <span className="text-sm text-black">{role.name}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex flex-col gap-4 flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="code">Код роли *</Label>
                  <Input
                    id="code"
                    placeholder="ADMIN"
                    disabled={isSubmitting}
                    {...form.register("code")}
                  />
                  {form.formState.errors.code && (
                    <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Название *</Label>
                  <Input
                    id="name"
                    placeholder="Администратор"
                    disabled={isSubmitting}
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md">
          <Button
            type="button"
            disabled={isSubmitting}
            className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
            onClick={() => navigate({ to: "/roles" })}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {role && (
            <Button
              type="button"
              className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-4 bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </form>
    </div>
  );
};
