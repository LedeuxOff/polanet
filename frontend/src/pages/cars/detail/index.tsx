import { Link, useNavigate } from "@tanstack/react-router";
import { useCarDetailPage } from "./hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronLeft, TrashIcon } from "lucide-react";

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
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Автомобили</CardTitle>

            <div className="flex items-center gap-2">
              <Link to="/cars" className="text-sm text-muted-foreground">
                Список автомобилей
              </Link>

              <span className="text-sm text-muted-foreground">/</span>

              <span className="text-sm text-black">{car.brand}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex gap-4">
          <div className="flex flex-col gap-4 flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="brand">Марка</Label>
                  <Input id="brand" disabled={isSubmitting} {...form.register("brand")} />
                  {form.formState.errors.brand && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.brand.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licensePlate">Гос номер</Label>
                  <Input
                    id="licensePlate"
                    disabled={isSubmitting}
                    {...form.register("licensePlate")}
                  />
                  {form.formState.errors.licensePlate && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.licensePlate.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md">
          <Button
            type="button"
            disabled={isDeleting || isSubmitting}
            className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
            onClick={() => navigate({ to: "/cars" })}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {car && (
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
            disabled={isDeleting || isSubmitting}
            className="px-8 py-4 bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </form>
    </div>
  );
};
