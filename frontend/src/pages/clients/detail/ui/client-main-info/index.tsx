import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks";
import { ClientForm } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<ClientForm>;
  clientType: "individual" | "legal";
  setClientType: Dispatch<SetStateAction<"individual" | "legal">>;
  isSubmitting: boolean;
}

export const ClientMainInfo = ({ form, clientType, setClientType, isSubmitting }: Props) => {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Основная информация</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="type">Тип клиента</Label>
          <Select
            value={clientType}
            disabled
            onValueChange={(value: "individual" | "legal") => {
              setClientType(value);
              form.setValue("type", value);
            }}
          >
            <SelectTrigger disabled={isSubmitting}>
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
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
                <Label htmlFor="lastName">Фамилия</Label>
                <Input id="lastName" disabled={isSubmitting} {...form.register("lastName")} />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">Имя</Label>
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
          </>
        ) : (
          <div className="space-y-2 mt-2">
            <Label htmlFor="organizationName">Название организации</Label>
            <Input
              id="organizationName"
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

        <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4 mt-2`}>
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input id="phone" disabled={isSubmitting} {...form.register("phone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" disabled={isSubmitting} {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
