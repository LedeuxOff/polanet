import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useUserDetailPage } from "./hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Send } from "lucide-react";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";

export const EditUserPage = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const {
    isLoading,
    user,
    form,
    onSubmit,
    isSubmitting,
    roles,
    isSendingPassword,
    handleSendPassword,
  } = useUserDetailPage();

  // Показываем лоадер пока загружаются данные или permissions
  if (isLoading || isPermissionsLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Загрузка...</CardContent>
      </Card>
    );
  }

  // Проверяем права на просмотр деталки
  if (!hasPermission("users:detail")) {
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

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Пользователь не найден
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Пользователи</CardTitle>

            <div className="flex items-center gap-2">
              <Link to="/users" className="text-sm text-muted-foreground">
                Список пользователей
              </Link>

              <span className="text-sm text-muted-foreground">/</span>

              <span className="text-sm text-black">
                {user.firstName} {user.lastName}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form
        onSubmit={form.handleSubmit(async (data) => {
          if (!hasPermission("users:update")) {
            showToast("У вас нет прав на редактирование пользователя", "error");
            return { success: false };
          }
          const result = await onSubmit(data);
          if (result.success) {
            showToast("Пользователь успешно сохранен", "success");
            navigate({ to: "/users" });
          } else if (result.error) {
            showToast(result.error, "error");
          }
        })}
      >
        <div className="flex gap-4">
          <div className="flex flex-col gap-4 flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Фамилия *</Label>
                    <Input id="lastName" disabled={isSubmitting} {...form.register("lastName")} />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firstName">Имя *</Label>
                    <Input id="firstName" disabled={isSubmitting} {...form.register("firstName")} />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="middleName">Отчество</Label>
                    <Input
                      id="middleName"
                      disabled={isSubmitting}
                      {...form.register("middleName")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
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
                    <Input id="phone" disabled={isSubmitting} {...form.register("phone")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Дата рождения</Label>
                    <Input
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
                      <SelectTrigger disabled={isSubmitting}>
                        <SelectValue placeholder="Выберите роль" />
                      </SelectTrigger>
                      <SelectContent>
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

        <div className="fixed bottom-8 left-1/2 flex flex-col gap-2 p-2 bg-zinc-800/80 rounded-md">
          <div className="flex gap-2">
            <Button
              type="button"
              disabled={isSubmitting}
              className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
              onClick={() => navigate({ to: "/users" })}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 bg-blue-600 rounded-md hover:bg-blue-700 flex-1"
            >
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>

          <Button
            type="button"
            disabled={isSendingPassword}
            onClick={() => {
              if (!hasPermission("users:sendPassword")) {
                showToast("У вас нет прав на отправку пароля", "error");
                return;
              }
              handleSendPassword();
            }}
            className="bg-zinc-800 hover:bg-zinc-900"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSendingPassword ? "Отправка..." : "Выслать новый пароль"}
          </Button>
        </div>
      </form>
    </div>
  );
};
