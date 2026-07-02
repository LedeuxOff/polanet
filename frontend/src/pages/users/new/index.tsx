import { Link, useNavigate } from "@tanstack/react-router";
import { useNewUserPage } from "./hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InputPhone } from "@/components/ui/input-phone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronLeft, ChevronUp, MenuIcon } from "lucide-react";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export const NewUserPage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);

  const navigate = useNavigate();
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();

  const { form, onSubmit, isSubmitting, roles } = useNewUserPage();

  // Показываем лоадер пока загружаются permissions
  if (isPermissionsLoading) {
    return (
      <Card className="rounded-2xl shadow-xl">
        <CardContent className="py-8 text-center text-muted-foreground">
          Загрузка прав доступа...
        </CardContent>
      </Card>
    );
  }

  // Проверяем права на создание пользователя
  if (!hasPermission("users:create")) {
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

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle>Сотрудники</CardTitle>

            {!isMobile && (
              <div className="flex items-center gap-2">
                <Link to="/users" className="text-sm text-muted-foreground">
                  <Badge variant="outline">Список сотрудников</Badge>
                </Link>

                <span className="w-1 h-1 bg-blue-400 rounded-full" />

                <Badge variant="secondary">Создание сотрудника</Badge>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <form
        onSubmit={form.handleSubmit(async (data) => {
          if (!hasPermission("users:create")) {
            showToast("У вас нет прав на создание пользователя", "error");
            return { success: false };
          }
          const result = await onSubmit(data);
          if (result.success) {
            showToast("Пользователь успешно создан", "success");
            navigate({ to: "/users" });
          } else if (result.error) {
            showToast(result.error, "error");
          }
        })}
      >
        <div className="flex gap-4 pb-32">
          <div className="flex flex-col gap-4 flex-1">
            <Card className="rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Фамилия *</Label>
                    <Input
                      className="rounded-2xl"
                      id="lastName"
                      disabled={isSubmitting}
                      {...form.register("lastName")}
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firstName">Имя *</Label>
                    <Input
                      className="rounded-2xl"
                      id="firstName"
                      disabled={isSubmitting}
                      {...form.register("firstName")}
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="middleName">Отчество</Label>
                    <Input
                      className="rounded-2xl"
                      id="middleName"
                      disabled={isSubmitting}
                      {...form.register("middleName")}
                    />
                  </div>
                </div>

                <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      className="rounded-2xl"
                      id="email"
                      type="email"
                      disabled={isSubmitting}
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <InputPhone
                      className="rounded-2xl"
                      id="phone"
                      disabled={isSubmitting}
                      onPhoneChange={(value) =>
                        form.setValue("phone", value || "", { shouldValidate: true })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Дата рождения</Label>
                    <Input
                      className="rounded-2xl"
                      id="birthDate"
                      type="date"
                      disabled={isSubmitting}
                      {...form.register("birthDate")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roleId">Роль *</Label>
                    <Select
                      value={String(form.watch("roleId") || "")}
                      onValueChange={(value) => form.setValue("roleId", Number(value))}
                    >
                      <SelectTrigger disabled={isSubmitting} className="rounded-2xl">
                        <SelectValue placeholder="Выберите роль" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-xl">
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.roleId && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.roleId.message}
                      </p>
                    )}
                  </div>
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

          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Button
                type="button"
                disabled={isSubmitting}
                className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
                onClick={() => navigate({ to: "/users" })}
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

              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-blue-500/90 rounded-2xl hover:bg-blue-600 flex-1"
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
          </div>
        </div>
      </form>
    </div>
  );
};
