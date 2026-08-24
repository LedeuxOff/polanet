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
import { useIsMobile } from "@/hooks";
import { NewClientForm } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<NewClientForm>;
  clientType: "individual" | "legal";
  setClientType: Dispatch<SetStateAction<"individual" | "legal">>;
  isSubmitting: boolean;
}

export const ClientNewPageFormMainSection = ({
  form,
  clientType,
  setClientType,
  isSubmitting,
}: Props) => {
  const isMobile = useIsMobile();

  return (
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <CardTitle>Основная информация</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Тип клиента *</Label>
            <Select
              value={clientType}
              onValueChange={(value: "individual" | "legal") => {
                setClientType(value);
                form.setValue("type", value);
                // Сбрасываем поля при смене типа
                if (value === "individual") {
                  form.setValue("organizationName", undefined);
                } else {
                  form.setValue("lastName", undefined);
                  form.setValue("firstName", undefined);
                  form.setValue("middleName", undefined);
                }
              }}
            >
              <SelectTrigger
                disabled={isSubmitting}
                className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
              >
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
                <SelectItem value="individual">Физическое лицо</SelectItem>
                <SelectItem value="legal">Юридическое лицо</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
            )}
          </div>
          {clientType === "individual" ? (
            <>
              <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия *</Label>
                  <Input
                    className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                    id="lastName"
                    placeholder="Иванов"
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
                    className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                    id="firstName"
                    placeholder="Иван"
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
                    className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                    id="middleName"
                    placeholder="Иванович"
                    disabled={isSubmitting}
                    {...form.register("middleName")}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="organizationName">Название организации *</Label>
              <Input
                className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                id="organizationName"
                placeholder='ООО "Ромашка"'
                disabled={isSubmitting}
                {...form.register("organizationName")}
              />
              {form.formState.errors.organizationName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.organizationName.message}
                </p>
              )}
            </div>
          )}

          <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <InputPhone
                className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                id="phone"
                disabled={isSubmitting}
                onPhoneChange={(value) =>
                  form.setValue("phone", value || "", { shouldValidate: true })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                id="email"
                type="email"
                placeholder="email@example.com"
                disabled={isSubmitting}
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
