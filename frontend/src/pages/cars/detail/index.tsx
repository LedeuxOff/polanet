import { Link, useNavigate } from "@tanstack/react-router";
import { useCarDetailPage } from "./hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronLeft, ChevronUp, MenuIcon, TrashIcon } from "lucide-react";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export const EditCarPage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);

  const navigate = useNavigate();
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();
  const { isLoading, car, handleDelete, isDeleting, form, onSubmit, isSubmitting } =
    useCarDetailPage();

  if (isLoading || isPermissionsLoading) {
    return (
      <Card className="rounded-2xl shadow-xl">
        <CardContent className="py-8 text-center text-muted-foreground">Загрузка...</CardContent>
      </Card>
    );
  }

  if (!hasPermission("cars:detail")) {
    return (
      <Card className="rounded-2xl shadow-xl">
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

  if (!car) {
    return (
      <Card className="rounded-2xl shadow-xl">
        <CardContent className="py-8 text-center text-muted-foreground">
          Автомобиль не найден
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle>Автомобили</CardTitle>

            <div className="flex items-center gap-2">
              <Link to="/cars" className="text-sm text-muted-foreground">
                <Badge variant="outline">Список</Badge>
              </Link>

              <span className="w-1 h-1 bg-blue-400 rounded-full" />

              <Badge variant="secondary">{car.brand}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form
        onSubmit={form.handleSubmit(async (data) => {
          if (!hasPermission("cars:update")) {
            showToast("У вас нет прав на редактирование автомобиля", "error");
            return;
          }
          await onSubmit(data);
          showToast("Автомобиль успешно сохранен", "success");
          navigate({ to: "/cars" });
        })}
      >
        <div className="flex gap-4">
          <div className="flex flex-col gap-4 flex-1">
            <Card className="rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="space-y-2">
                  <Label htmlFor="brand">Марка</Label>
                  <Input
                    className="rounded-2xl"
                    id="brand"
                    disabled={isSubmitting}
                    {...form.register("brand")}
                  />
                  {form.formState.errors.brand && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.brand.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licensePlate">Гос номер</Label>
                  <Input
                    className="rounded-2xl"
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

        <div
          className={`fixed transition-all ${isMobile ? (hideBottomTabbar ? "-bottom-[58px]" : "bottom-2") : hideBottomTabbar ? "-bottom-[58px]" : "bottom-4"} left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-zinc-600/30 backdrop-blur-md shadow-xl border-zinc-200 rounded-2xl`}
        >
          <div
            onClick={() => setHideBottomTabbar(false)}
            className={`absolute -top-4 left-1/2 -translate-x-1/2 px-1 pb-2 bg-[rgb(194,194,197)] rounded-2xl hover:bg-[rgb(173,173,176)] flex items-center justify-center cursor-pointer z-10 transition-all ${hideBottomTabbar ? "opacity-100" : "opacity-0"}`}
          >
            <ChevronUp className="text-white w-5" />
          </div>

          <Button
            type="button"
            disabled={isDeleting || isSubmitting}
            className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
            onClick={() => navigate({ to: "/cars" })}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {isMobile && (
            <Button
              type="button"
              className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
              onClick={() => setOpen(true)}
            >
              <MenuIcon className="w-4 h-4" />
            </Button>
          )}

          {car && (
            <Button
              type="button"
              className="px-3 py-4 bg-red-400 rounded-2xl hover:bg-red-500"
              onClick={() => {
                if (!hasPermission("cars:delete")) {
                  showToast("У вас нет прав на удаление автомобиля", "error");
                  return;
                }
                handleDelete();
              }}
              disabled={isDeleting || isSubmitting}
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          )}

          <Button
            type="submit"
            disabled={isDeleting || isSubmitting}
            className="px-8 py-4 bg-blue-500/90 rounded-2xl hover:bg-blue-600"
          >
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>

          <Button
            onClick={() => setHideBottomTabbar(true)}
            type="button"
            className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
