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
import { ChevronLeft, MenuIcon } from "lucide-react";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";

export const NewTransportCardPage = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();
  const { form, drivers, isSubmitting, onSubmit } = useNewTransportCardPage();

  if (isPermissionsLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Загрузка прав доступа...
        </CardContent>
      </Card>
    );
  }

  if (!hasPermission("transport-cards:create")) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">У вас нет доступа к этой странице</p>
          <Link to="/">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Вернуться на главную
            </button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Транспортные карты</CardTitle>

            <div className="flex items-center gap-2">
              <Link to="/transport-cards" className="text-sm text-muted-foreground">
                Список
              </Link>

              <span className="text-sm text-muted-foreground">/</span>

              <span className="text-sm text-black">Создание</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form
        onSubmit={form.handleSubmit(async (data) => {
          if (!hasPermission("transport-cards:create")) {
            showToast("У вас нет прав на создание карты", "error");
            return;
          }
          await onSubmit(data);
          showToast("Транспортная карта успешно создана", "success");
          navigate({ to: "/transport-cards" });
        })}
      >
        <div className="flex gap-4">
          <div className="flex flex-col gap-4 flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
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

        <div
          className={`fixed ${isMobile ? "bottom-2" : "bottom-8"} left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md`}
        >
          <Button
            type="button"
            disabled={isSubmitting}
            className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
            onClick={() => navigate({ to: "/transport-cards" })}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {isMobile && (
            <Button
              type="button"
              className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
              onClick={() => setOpen(true)}
            >
              <MenuIcon className="w-4 h-4" />
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
