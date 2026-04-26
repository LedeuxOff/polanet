import { useNavigate } from "@tanstack/react-router";
import { useNewRolePage } from "./hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const NewRolePage = () => {
  const navigate = useNavigate();
  const { form, isSubmitting, error, onSubmit } = useNewRolePage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новая роль</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
          )}

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

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Создание..." : "Создать"}
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
