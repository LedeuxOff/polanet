import { useChangePasswordPage, type ChangePasswordForm } from "./hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronLeft, ChevronUp, MenuIcon } from "lucide-react";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export const ChangePasswordPage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);

  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();

  const { isLoading, form, onSubmit, isSubmitting, error } = useChangePasswordPage();

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

  // Проверяем права на просмотр сторницы
  if (!hasPermission("users:update")) {
    return (
      <Card className="rounded-2xl shadow-xl">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">У вас нет доступа к этой странице</p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Вернуться на главную
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle>Смена пароля</CardTitle>
          </div>
        </CardHeader>
      </Card>

      <Card className="rounded-2xl shadow-xl pt-4">
        <div className={`flex flex-col gap-4`}>
          <div className="flex flex-col gap-4 flex-1">
            <CardContent className="flex flex-col gap-4">
              {error && (
                <div className="p-3 bg-red-100 text-red-800 rounded-2xl text-sm">{error}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="oldPassword">Старый пароль *</Label>
                <Input
                  className="rounded-2xl"
                  id="oldPassword"
                  type="password"
                  disabled={isSubmitting}
                  {...form.register("oldPassword")}
                />
                {form.formState.errors.oldPassword && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.oldPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Новый пароль *</Label>
                <Input
                  className="rounded-2xl"
                  id="newPassword"
                  type="password"
                  disabled={isSubmitting}
                  {...form.register("newPassword")}
                />
                {form.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Повторите новый пароль *</Label>
                <Input
                  className="rounded-2xl"
                  id="confirmPassword"
                  type="password"
                  disabled={isSubmitting}
                  {...form.register("confirmPassword")}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </CardContent>
          </div>
        </div>
      </Card>

      <div
        className={`fixed transition-all ${isMobile ? (hideBottomTabbar ? "-bottom-[56px]" : "bottom-2") : hideBottomTabbar ? "-bottom-[56px]" : "bottom-4"} left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-zinc-600/30 backdrop-blur-md shadow-xl border-zinc-200 rounded-2xl`}
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
              onClick={() => window.history.back()}
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
              onClick={form.handleSubmit(async (data: ChangePasswordForm) => {
                const result = await onSubmit(data);
                if (result.success) {
                  showToast("Пароль успешно изменен", "success");
                  window.history.back();
                } else {
                  showToast(result.error || "Ошибка при смене пароля", "error");
                }
              })}
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
    </div>
  );
};
