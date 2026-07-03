import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useUserDetailPage } from "./hooks";
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
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  FileText,
  MenuIcon,
  Send,
  TrashIcon,
  Truck,
} from "lucide-react";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { useAuth } from "@/lib/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export const EditUserPage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const navigate = useNavigate();
  const { userId } = useParams({ from: "/users/$userId" });
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();
  const { user: currentUser } = useAuth();

  // Проверяем, просматривает ли пользователь свою собственную карточку
  const isOwnUser = currentUser?.id === Number(userId);

  const {
    isLoading,
    user,
    form,
    onSubmit,
    error,
    isSubmitting,
    roles,
    isSendingPassword,
    handleSendPassword,
    isUnbindingTelegram,
    handleUnbindTelegram,
    isDeleting,
    handleDelete,
    // Transport card
    availableCards,
    isFetchingCards,
    isAttachingCard,
    isDetachingCard,
    handleAttachCard,
    handleDetachCard,
  } = useUserDetailPage();

  const isDriver = user?.roleCode === "DRIVER";

  // Get current transport card from available cards or user data
  const currentTransportCard = user?.transportCardId
    ? availableCards.find((card) => card.id === user.transportCardId) || null
    : null;

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

  if (!user) {
    return (
      <Card className="rounded-2xl shadow-xl">
        <CardContent className="py-8 text-center text-muted-foreground">
          Пользователь не найден
        </CardContent>
      </Card>
    );
  }

  const renderTransportCardTab = () => {
    if (!isDriver) {
      return (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <div className="text-center">
            <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Транспортная карта доступна только для сотрудников с ролью "Водитель"</p>
          </div>
        </div>
      );
    }

    if (isFetchingCards) {
      return (
        <div className="flex items-center justify-center py-12">
          <Skeleton className="w-48 h-8" />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Current attached card */}
        {currentTransportCard || user?.transportCardNumber ? (
          <Card className="rounded-2xl shadow-xl">
            <CardContent className="pt-4">
              <div className="rounded-2xl border border-zinc-200 py-8 flex flex-col gap-4">
                <div className="h-8 bg-zinc-200 w-full" />

                <div className="px-4">
                  <p className="text-sm text-muted-foreground">Номер карты</p>
                  <p className="text-lg font-mono font-semibold">
                    {currentTransportCard?.cardNumber || user?.transportCardNumber}
                  </p>
                </div>

                <div className="px-4 flex justify-between gap-4">
                  <Badge
                    className={
                      currentTransportCard?.status === "active" ||
                      user?.transportCardStatus === "active"
                        ? "bg-green-100 border border-green-600 text-green-600 px-8 py-2 rounded-2xl hover:bg-green-100"
                        : "bg-red-100 border border-red-600 text-red-600 px-8 py-2 rounded-2xl hover:bg-red-100"
                    }
                  >
                    {(currentTransportCard?.status || user?.transportCardStatus) === "active"
                      ? "Активна"
                      : "Неактивна"}
                  </Badge>

                  <Button
                    onClick={handleDetachCard}
                    disabled={isDetachingCard}
                    className="rounded-2xl bg-red-400 hover:bg-red-500 text-white px-4"
                  >
                    {isDetachingCard ? "Отвязываю..." : "Отвязать карту"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle>Нет привязанной карты</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                К этому сотруднику не привязана транспортная карта. Выберите карту ниже для
                привязки.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Available cards to attach */}
        {!currentTransportCard && !user?.transportCardNumber && availableCards.length > 0 && (
          <Card className="rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle>Доступные карты для привязки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {availableCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-start justify-between p-4 rounded-2xl bg-zinc-100 border border-zinc-100 shadow-xl"
                >
                  <div className="space-y-4">
                    <p className="font-mono font-semibold">{card.cardNumber}</p>
                    <Badge
                      className={
                        card?.status === "active"
                          ? "bg-green-100 border border-green-600 text-green-600 px-8 py-2 rounded-2xl hover:bg-green-100"
                          : "bg-red-100 border border-red-600 text-red-600 px-8 py-2 rounded-2xl hover:bg-red-100"
                      }
                    >
                      {card?.status === "active" ? "Активна" : "Неактивна"}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleAttachCard(card.id)}
                    disabled={isAttachingCard}
                    className="rounded-2xl bg-blue-500 hover:bg-blue-600 px-4"
                  >
                    {isAttachingCard ? "Привязываю..." : "Привязать"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {availableCards.length === 0 && !currentTransportCard && !user?.transportCardNumber && (
          <Card className="rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle>Нет доступных карт</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Все транспортные карты уже привязаны к сотрудникам. Сначала создайте новую карту.
              </p>
              <Link to="/transport-cards/new">
                <Button className="mt-4 rounded-2xl">Создать транспортную карту</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

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

                <Badge variant="secondary">
                  {user.firstName} {user.lastName}
                </Badge>
              </div>
            )}
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
        <div className="flex gap-4 pb-32">
          <div className="flex flex-col gap-4 flex-1">
            {/* Tabs */}
            <div className="flex gap-1 p-1.5 bg-white border border-zinc-200 rounded-2xl shadow-xl">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  activeTab === "details"
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className={!isMobile ? "" : "hidden"}>Основная информация</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("transport-card")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  activeTab === "transport-card"
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                <Truck className="w-4 h-4" />
                <span className={!isMobile ? "" : "hidden"}>Транспортная карта</span>
              </button>
            </div>

            {/* Details Tab */}
            {activeTab === "details" && (
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
                          value={user?.telegramChatId || ""}
                          disabled
                          placeholder="Не привязан"
                        />

                        {user?.telegramChatId && (isOwnUser || user?.roleCode === "DEVELOPER") && (
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
                      <Select
                        value={String(form.watch("roleId") || "")}
                        onValueChange={(value) => form.setValue("roleId", Number(value))}
                      >
                        <SelectTrigger disabled={isSubmitting} className="rounded-2xl">
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
            )}

            {/* Transport Card Tab */}
            {activeTab === "transport-card" && renderTransportCardTab()}
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

              {user?.roleCode === "DEVELOPER" && !isOwnUser && (
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
              disabled={isSendingPassword || !user?.telegramChatId || isDriver}
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
