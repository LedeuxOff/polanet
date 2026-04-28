import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNewTransportCardPage } from "./hooks";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export const NewTransportCardPage = () => {
  const navigate = useNavigate();
  const { form, drivers, isSubmitting, error, onSubmit } = useNewTransportCardPage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новая транспортная карта</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Номер карты *</Label>
            <Input
              id="cardNumber"
              placeholder="12345678"
              disabled={isSubmitting}
              {...form.register("cardNumber")}
            />
            {form.formState.errors.cardNumber && (
              <p className="text-sm text-destructive">{form.formState.errors.cardNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select
              value={form.watch("status") || "active"}
              onValueChange={(value: "active" | "inactive") => form.setValue("status", value)}
            >
              <SelectTrigger disabled={isSubmitting}>
                <SelectValue placeholder="Активна" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активна</SelectItem>
                <SelectItem value="inactive">Неактивна</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="driverId">Водитель</Label>
            <Select
              value={String(form.watch("driverId") || "")}
              onValueChange={(value) => form.setValue("driverId", value ? Number(value) : null)}
            >
              <SelectTrigger disabled={isSubmitting}>
                <SelectValue placeholder="Не назначен" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={String(driver.id)}>
                    {driver.lastName} {driver.firstName} {driver.middleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Создание..." : "Создать"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/transport-cards" })}
            >
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
