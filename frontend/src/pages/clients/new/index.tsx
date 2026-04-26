import { useNavigate } from "@tanstack/react-router";
import { useNewClientPage } from "./hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const NewClientPage = () => {
  const navigate = useNavigate();
  const { form, onSubmit, error, clientType, setClientType, isSubmitting } = useNewClientPage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новый клиент</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
          )}

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
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия *</Label>
                  <Input
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                placeholder="+7 (999) 000-00-00"
                disabled={isSubmitting}
                {...form.register("phone")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
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

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Создание..." : "Создать"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/clients" })}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
