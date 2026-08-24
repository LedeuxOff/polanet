import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useDeveloperDetailPage } from "./hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { ChevronDown, ChevronLeft, ChevronUp, MenuIcon, Send, TrashIcon } from "lucide-react";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { useAuth } from "@/lib/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export const EditDeveloperPage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);

  const navigate = useNavigate();
  const { developerId } = useParams({ from: "/developers/$developerId" });
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();
  const { user: currentUser } = useAuth();

  // Проверяем, просматривает ли пользователь свою собственную карточку
  const isOwnUser = currentUser?.id === Number(developerId);

  const {
    isLoading,
    developer,
    form,
    onSubmit,
    isSubmitting,
    isSendingPassword,
    handleSendPassword,
    isUnbindingTelegram,
    handleUnbindTelegram,
    isDeleting,
    handleDelete,
  } = useDeveloperDetailPage();

  // Показываем лоадер пока загружаются данные или permissions
  if (isLoading || isPermissionsLoading) {
    return (
      <div className="w-full flex flex-col gap-2">
        <Card className="rounded-2xl shadow-xl p-0 overflow-hidden">
          <CardContent className="p-0">
            <Skeleton className="w-full h-16" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-xl p-0 overflow-hidden">
          <CardContent className="p-0">
            <Skeleton className="w-full h-64" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Проверяем права на просмотр деталки
  if (!hasPermission("users:detail")) {
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

  if (!developer) {
    return (
      <Card className="rounded-2xl shadow-xl">
        <CardContent className="py-8 text-center text-muted-foreground">
          Разработчик не найден
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle>Разработчики</CardTitle>

            {!isMobile && (
              <div className="flex items-center gap-2">
                <Link to="/developers" className="text-sm text-muted-foreground">
                  <Badge variant="outline">Список разработчиков</Badge>
                </Link>

                <span className="w-1 h-1 bg-blue-400 rounded-full" />

                <Badge variant="secondary">
                  {developer.firstName} {developer.lastName}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <form
        onSubmit={form.handleSubmit(async (data) => {
          if (!hasPermission("users:update")) {
            showToast("У вас нет прав на редактирование разработчика", "error");
            return { success: false };
          }
          const result = await onSubmit(data);
          if (result.success) {
            showToast("Разработчик успешно сохранен", "success");
            navigate({ to: "/developers" });
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
                      value={form.watch("phone")}
                      onPhoneChange={(value) =>
                        form.setValue("phone", value || "", { shouldValidate: true })
                      }
                    />
                  </div>

                  <div className="col-span-3 space-y-2">
                    <Label htmlFor="telegramChatId">Telegram Chat ID</Label>
                    <div className="flex gap-2">
                      <Input
                        className="rounded-2xl flex-1"
                        id="telegramChatId"
                        value={developer?.telegramChatId || ""}
                        disabled
                        placeholder="Не привязан"
                      />

                      {developer?.telegramChatId && isOwnUser && (
                        <Button
                          type="button"
                          disabled={isUnbindingTelegram}
                          onClick={handleUnbindTelegram}
                          className="rounded-2xl bg-red-400 hover:bg-red-500 px-4"
                        >
                          {isUnbindingTelegram ? "Отвязываю..." : "Отвязать"}
                        </Button>
                      )}
                    </div>
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
                    <Select value="1" disabled>
                      <SelectTrigger className="rounded-2xl bg-zinc-100">
                        <SelectValue placeholder="Выберите роль" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Разработчик</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div
          className={`fixed transition-all ${isMobile ? (hideBottomTabbar ? "-bottom-[112px]" : "bottom-2") : hideBottomTabbar ? "-bottom-[112px]" : "bottom-4"} left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-zinc-600/30 backdrop-blur-md shadow-xl border-zinc-200 rounded-2xl`}
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
                onClick={() => navigate({ to: "/developers" })}
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

              {!isOwnUser && (
                <Button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="px-3 py-4 bg-red-400 hover:bg-red-500 rounded-2xl"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              )}

              <Button
                onClick={() => setHideBottomTabbar(true)}
                type="button"
                className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
            <Button
              type="button"
              disabled={isSendingPassword || !developer?.telegramChatId}
              onClick={() => {
                if (!hasPermission("users:sendPassword")) {
                  showToast("У вас нет прав на отправку пароля", "error");
                  return;
                }
                handleSendPassword();
              }}
              className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSendingPassword ? "Отправка..." : "Выслать новый пароль"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
