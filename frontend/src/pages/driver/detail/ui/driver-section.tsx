import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Driver, DriverForm } from "@/lib/types";
import { useNavigate } from "@tanstack/react-router";
import { UseFormReturn } from "react-hook-form";

interface Props {
  driver: Driver;
  handleDelete: () => Promise<void>;
  isDeleting: boolean;
  form: UseFormReturn<DriverForm>;
  onSubmit: (data: DriverForm) => Promise<void>;
  error: string | null;
  isSubmitting: boolean;
}

export const DriverSection = ({
  driver,
  handleDelete,
  isDeleting,
  form,
  onSubmit,
  error,
  isSubmitting,
}: Props) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Редактирование водителя</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {driver.lastName} {driver.firstName} {driver.middleName}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName">Фамилия</Label>
              <Input id="lastName" disabled={isSubmitting} {...form.register("lastName")} />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">Имя</Label>
              <Input id="firstName" disabled={isSubmitting} {...form.register("firstName")} />
              {form.formState.errors.firstName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="middleName">Отчество</Label>
              <Input id="middleName" disabled={isSubmitting} {...form.register("middleName")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" disabled={isSubmitting} {...form.register("phone")} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/drivers" })}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
