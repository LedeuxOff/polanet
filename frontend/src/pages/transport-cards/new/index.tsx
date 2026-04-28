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
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export const NewTransportCardPage = () => {
  const navigate = useNavigate();
  const { form, drivers, isSubmitting, error, onSubmit } = useNewTransportCardPage();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Транспортные карты</CardTitle>

            <div className="flex items-center gap-2">
              <Link to="/transport-cards" className="text-sm text-muted-foreground">
                Список транспортных карт
              </Link>

              <span className="text-sm text-muted-foreground">/</span>

              <span className="text-sm text-black">Создание карты</span>
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
                  <Label htmlFor="cardNumber">Номер карты *</Label>
                  <Input
                    id="cardNumber"
                    placeholder="12345678"
                    disabled={isSubmitting}
                    {...form.register("cardNumber")}
                  />
                  {form.formState.errors.cardNumber && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.cardNumber.message}
                    </p>
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
                    onValueChange={(value) =>
                      form.setValue("driverId", value ? Number(value) : null)
                    }
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
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md">
          <Button
            type="button"
            disabled={isSubmitting}
            className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
            onClick={() => navigate({ to: "/transport-cards" })}
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
