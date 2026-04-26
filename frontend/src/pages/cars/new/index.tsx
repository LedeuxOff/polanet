import { useNavigate } from "@tanstack/react-router";
import { useNewCarPage } from "./hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const NewCarPage = () => {
  const navigate = useNavigate();
  const { form, isSubmitting, error, onSubmit } = useNewCarPage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новый автомобиль</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="brand">Марка *</Label>
            <Input
              id="brand"
              placeholder="Toyota"
              disabled={isSubmitting}
              {...form.register("brand")}
            />
            {form.formState.errors.brand && (
              <p className="text-sm text-destructive">{form.formState.errors.brand.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licensePlate">Гос номер *</Label>
            <Input
              id="licensePlate"
              placeholder="А 000 АА 777"
              disabled={isSubmitting}
              {...form.register("licensePlate")}
            />
            {form.formState.errors.licensePlate && (
              <p className="text-sm text-destructive">
                {form.formState.errors.licensePlate.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Создание..." : "Создать"}
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
