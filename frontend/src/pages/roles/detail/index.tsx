import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoleDetailPage } from "./hooks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft, TrashIcon, SaveIcon, MenuIcon } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";

export const EditRolePage = () => {
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
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Загрузка...</CardContent>
      </Card>
    );
  }

  if (!role) {
    return (
      <Card>
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
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Роли</CardTitle>

            <div className="flex items-center gap-2">
              <Link to="/roles" className="text-sm text-muted-foreground">
                Список ролей
              </Link>

              <span className="text-sm text-muted-foreground">/</span>

              <span className="text-sm text-black">{role.name}</span>
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
                  <Label htmlFor="code">Код роли *</Label>
                  <Input
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Права доступа</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPermissions(!showPermissions)}
                >
                  {showPermissions ? "Скрыть" : "Показать"}
                </Button>
              </CardHeader>
              {showPermissions && (
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(permissionsByModule).map(([moduleKey, modulePermissions]) => (
                      <div key={moduleKey} className="border rounded-lg p-4">
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
          className={`fixed ${isMobile ? "bottom-2" : "bottom-8"} left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md`}
        >
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                type="button"
                disabled={isSubmitting}
                className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
                onClick={() => navigate({ to: "/roles" })}
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

              {role && canDelete && (
                <Button
                  type="button"
                  className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                >
                  <TrashIcon className="w-4 h-4" />
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

            <Button
              type="button"
              onClick={handleSavePermissions}
              disabled={isSavingPermissions || isSubmitting}
              className="px-6 py-4 bg-green-600 rounded-md hover:bg-green-700"
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
