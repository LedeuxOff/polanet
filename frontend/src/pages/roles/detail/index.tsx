import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoleDetailPage } from "./hooks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft, TrashIcon, SaveIcon, MenuIcon, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { Badge } from "@/components/ui/badge";

export const EditRolePage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);

  const { roleId: roleIdStr } = useParams({ from: "/roles/$roleId" });
  const roleId = parseInt(roleIdStr);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();
  const [showPermissions, setShowPermissions] = useState(false);
  const {
    isLoading,
    isDeleting,
    isSubmitting,
    isSavingPermissions,
    role,
    rolePermissions,
    permissionsByModule,
    moduleNames,
    form,
    onSubmit,
    savePermissions,
    handleDelete,
    togglePermission,
    toggleModulePermissions,
    canDelete,
  } = useRoleDetailPage(roleId);

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-xl">
        <CardContent className="py-8 text-center text-muted-foreground">Загрузка...</CardContent>
      </Card>
    );
  }

  if (!role) {
    return (
      <Card className="rounded-2xl shadow-xl">
        <CardContent className="py-8 text-center text-muted-foreground">
          Роль не найдена
        </CardContent>
      </Card>
    );
  }

  const handleSavePermissions = async () => {
    await savePermissions(rolePermissions);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle>Роли</CardTitle>

            <div className="flex items-center gap-2">
              <Link to="/roles" className="text-sm text-muted-foreground">
                <Badge variant="outline">Список ролей</Badge>
              </Link>

              <span className="w-1 h-1 bg-blue-400 rounded-full" />

              <Badge variant="secondary">{role.name}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex flex-col gap-4 flex-1">
            <Card className="rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="code">Код роли *</Label>
                  <Input
                    className="rounded-2xl"
                    id="code"
                    placeholder="ADMIN"
                    disabled={isSubmitting}
                    {...form.register("code")}
                  />
                  {form.formState.errors.code && (
                    <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Название *</Label>
                  <Input
                    className="rounded-2xl"
                    id="name"
                    placeholder="Администратор"
                    disabled={isSubmitting}
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Секция прав доступа */}
            <Card className="rounded-2xl shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Права доступа</CardTitle>
                <Button
                  type="button"
                  onClick={() => setShowPermissions(!showPermissions)}
                  className="rounded-2xl bg-blue-400 hover:bg-blue-500"
                >
                  {showPermissions ? "Скрыть" : "Показать"}
                </Button>
              </CardHeader>
              {showPermissions && (
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(permissionsByModule).map(([moduleKey, modulePermissions]) => (
                      <div key={moduleKey} className="border rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-base">
                            {moduleNames[moduleKey] || moduleKey}
                          </h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleModulePermissions(modulePermissions)}
                          >
                            {modulePermissions.every((p) => rolePermissions.includes(p.code))
                              ? "Снять все"
                              : "Выбрать все"}
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {modulePermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={permission.code}
                                checked={rolePermissions.includes(permission.code)}
                                onCheckedChange={() => togglePermission(permission.code)}
                              />
                              <label
                                htmlFor={permission.code}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {permission.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
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
                onClick={() => navigate({ to: "/roles" })}
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

              {role && canDelete && (
                <Button
                  type="button"
                  className="px-3 py-4 bg-red-400 rounded-2xl hover:bg-red-500"
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
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

            <Button
              type="button"
              onClick={handleSavePermissions}
              disabled={isSavingPermissions || isSubmitting}
              className="px-8 py-4 bg-green-500 rounded-2xl hover:bg-green-600"
            >
              <SaveIcon className="w-4 h-4 mr-2" />
              {isSavingPermissions ? "Сохранение..." : "Сохранить права"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
