import { useNavigate } from "@tanstack/react-router";
import { useCarDetailPage } from "./hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const EditCarPage = () => {
  const navigate = useNavigate();
  const { isLoading, car, handleDelete, isDeleting, form, onSubmit, error, isSubmitting } =
    useCarDetailPage();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Загрузка...</CardContent>
      </Card>
    );
  }

  if (!car) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Автомобиль не найден
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Редактирование автомобиля</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {car.brand} ({car.licensePlate})
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
            <Label htmlFor="brand">Марка</Label>
            <Input id="brand" disabled={isSubmitting} {...form.register("brand")} />
            {form.formState.errors.brand && (
              <p className="text-sm text-destructive">{form.formState.errors.brand.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licensePlate">Гос номер</Label>
            <Input id="licensePlate" disabled={isSubmitting} {...form.register("licensePlate")} />
            {form.formState.errors.licensePlate && (
              <p className="text-sm text-destructive">
                {form.formState.errors.licensePlate.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/cars" })}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
