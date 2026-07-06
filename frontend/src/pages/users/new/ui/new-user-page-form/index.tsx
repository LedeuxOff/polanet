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
import { Role, UserForm } from "@/lib/types";
import { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<UserForm>;
  disabled: boolean;
  roles: Role[];
}

export const NewUserPageForm = ({ form, disabled, roles }: Props) => {
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
              disabled={disabled}
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
              disabled={disabled}
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
              disabled={disabled}
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
              disabled={disabled}
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
              disabled={disabled}
              onPhoneChange={(value) =>
                form.setValue("phone", value || "", { shouldValidate: true })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Дата рождения</Label>
            <Input
              className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
              id="birthDate"
              type="date"
              disabled={disabled}
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
                disabled={disabled}
                className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
              >
                <SelectValue placeholder="Выберите роль" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
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
