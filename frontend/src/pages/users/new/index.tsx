import { useNavigate } from "@tanstack/react-router";
import { useNewUserPage } from "./hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export const NewUserPage = () => {
  const navigate = useNavigate();
  const { form, onSubmit, error, isSubmitting, roles } = useNewUserPage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новый пользователь</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName">Фамилия *</Label>
              <Input id="lastName" disabled={isSubmitting} {...form.register("lastName")} />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
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
              <Input id="middleName" disabled={isSubmitting} {...form.register("middleName")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" disabled={isSubmitting} {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" disabled={isSubmitting} {...form.register("phone")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Дата рождения</Label>
              <Input
                id="birthDate"
                type="date"
                disabled={isSubmitting}
                {...form.register("birthDate")}
              />
            </div>

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
                <p className="text-sm text-destructive">{form.formState.errors.roleId.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль *</Label>
            <Input
              id="password"
              type="password"
              disabled={isSubmitting}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Создание..." : "Создать"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/users" })}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
