import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputPhone } from "@/components/ui/input-phone";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Role, User, UserForm } from "@/lib/types";
import { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<UserForm>;
  isSubmitting: boolean;
  roles: Role[];
  user: User;
  handleUnbindTelegram: () => Promise<void>;
  isUnbindingTelegram: boolean;
  isOwnUser: boolean;
}

export const UserPageDetailsTab = ({
  form,
  isSubmitting,
  roles,
  user,
  handleUnbindTelegram,
  isUnbindingTelegram,
  isOwnUser,
}: Props) => {
  const isMobile = useIsMobile();

  return (
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <CardTitle>Основная информация</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
          <div className="space-y-2">
            <Label htmlFor="lastName">Фамилия *</Label>
            <Input
              className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
              id="lastName"
              disabled={isSubmitting}
              {...form.register("lastName")}
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">Имя *</Label>
            <Input
              className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
              id="firstName"
              disabled={isSubmitting}
              {...form.register("firstName")}
            />
            {form.formState.errors.firstName && (
              <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="middleName">Отчество</Label>
            <Input
              className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
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
              className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
              id="email"
              type="email"
              disabled={isSubmitting}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <InputPhone
              className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
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
                className="rounded-2xl flex-1 dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
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
                  className="rounded-2xl bg-red-400 hover:bg-red-500 px-4 dark:bg-red-500/40 dark:text-white dark:hover:bg-red-500/60"
                >
                  {isUnbindingTelegram ? "Отвязываю..." : "Отвязать"}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Дата рождения</Label>
            <Input
              className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
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
              <SelectTrigger
                disabled={isSubmitting}
                className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
              >
                <SelectValue placeholder="Выберите роль" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
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
      </CardContent>
    </Card>
  );
};
