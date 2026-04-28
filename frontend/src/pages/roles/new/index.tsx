import { Link, useNavigate } from "@tanstack/react-router";
import { useNewRolePage } from "./hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const NewRolePage = () => {
  const navigate = useNavigate();
  const { form, isSubmitting, onSubmit } = useNewRolePage();

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

              <span className="text-sm text-black">Создание роли</span>
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
