import { Link, useNavigate } from "@tanstack/react-router";
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
import { ChevronLeft, MenuIcon } from "lucide-react";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";

export const NewClientPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();
  const { form, onSubmit, clientType, setClientType, isSubmitting } = useNewClientPage();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Клиенты</CardTitle>

            <div className="flex items-center gap-2">
              <Link to="/clients" className="text-sm text-muted-foreground">
                Список
              </Link>

              <span className="text-sm text-muted-foreground">/</span>

              <span className="text-sm text-black">Создание</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)} className="pb-24">
        <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-4`}>
          <div className="flex flex-col gap-4 flex-1">
            <Card>
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
                      <SelectTrigger disabled={isSubmitting}>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Физическое лицо</SelectItem>
                        <SelectItem value="legal">Юридическое лицо</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.type && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.type.message}
                      </p>
                    )}
                  </div>
                  {clientType === "individual" ? (
                    <>
                      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
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

                  <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
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
                        <p className="text-sm text-destructive">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Плательщик</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
                    <div className="space-y-2">
                      <Label htmlFor="payer.lastName">Фамилия</Label>
                      <Input
                        id="payer.lastName"
                        placeholder="Иванов"
                        disabled={isSubmitting}
                        {...form.register("payer.lastName")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payer.firstName">Имя</Label>
                      <Input
                        id="payer.firstName"
                        placeholder="Иван"
                        disabled={isSubmitting}
                        {...form.register("payer.firstName")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payer.middleName">Отчество</Label>
                      <Input
                        id="payer.middleName"
                        placeholder="Иванович"
                        disabled={isSubmitting}
                        {...form.register("payer.middleName")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payer.phone">Телефон</Label>
                    <Input
                      id="payer.phone"
                      placeholder="+7 (999) 000-00-00"
                      disabled={isSubmitting}
                      {...form.register("payer.phone")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Приемщик</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
                    <div className="space-y-2">
                      <Label htmlFor="receiver.lastName">Фамилия</Label>
                      <Input
                        id="receiver.lastName"
                        placeholder="Петров"
                        disabled={isSubmitting}
                        {...form.register("receiver.lastName")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="receiver.firstName">Имя</Label>
                      <Input
                        id="receiver.firstName"
                        placeholder="Петр"
                        disabled={isSubmitting}
                        {...form.register("receiver.firstName")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="receiver.middleName">Отчество</Label>
                      <Input
                        id="receiver.middleName"
                        placeholder="Петрович"
                        disabled={isSubmitting}
                        {...form.register("receiver.middleName")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receiver.phone">Телефон</Label>
                    <Input
                      id="receiver.phone"
                      placeholder="+7 (999) 111-11-11"
                      disabled={isSubmitting}
                      {...form.register("receiver.phone")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div
          className={`fixed ${isMobile ? "bottom-2" : "bottom-8"} left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md`}
        >
          <Button
            type="button"
            disabled={isSubmitting}
            className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
            onClick={() => navigate({ to: "/clients" })}
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

          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-4 bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </form>
    </div>
  );
};
