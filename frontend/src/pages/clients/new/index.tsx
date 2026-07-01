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
import { InputPhone } from "@/components/ui/input-phone";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronLeft, ChevronUp, MenuIcon } from "lucide-react";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export const NewClientPage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);

  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();
  const { form, onSubmit, clientType, setClientType, isSubmitting } = useNewClientPage();

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle>Клиенты</CardTitle>

            <div className="flex items-center gap-2">
              <Link to="/clients" className="text-sm text-muted-foreground">
                <Badge variant="outline">Список</Badge>
              </Link>

              <span className="w-1 h-1 bg-blue-400 rounded-full" />

              <Badge variant="secondary">Создание</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className={`flex flex-col gap-4`}>
          <div className="flex flex-col gap-4 flex-1">
            <Card className="rounded-2xl shadow-xl">
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
                      <SelectTrigger disabled={isSubmitting} className="rounded-2xl">
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-xl">
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
                            className="rounded-2xl"
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
                            className="rounded-2xl"
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
                            className="rounded-2xl"
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
                        className="rounded-2xl"
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
                        className="rounded-2xl"
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
                        className="rounded-2xl"
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
            <Card className="rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle>Плательщик</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
                    <div className="space-y-2">
                      <Label htmlFor="payer.lastName">Фамилия</Label>
                      <Input
                        className="rounded-2xl"
                        id="payer.lastName"
                        placeholder="Иванов"
                        disabled={isSubmitting}
                        {...form.register("payer.lastName")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payer.firstName">Имя</Label>
                      <Input
                        className="rounded-2xl"
                        id="payer.firstName"
                        placeholder="Иван"
                        disabled={isSubmitting}
                        {...form.register("payer.firstName")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payer.middleName">Отчество</Label>
                      <Input
                        className="rounded-2xl"
                        id="payer.middleName"
                        placeholder="Иванович"
                        disabled={isSubmitting}
                        {...form.register("payer.middleName")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payer.phone">Телефон</Label>
                    <InputPhone
                      className="rounded-2xl"
                      id="payer.phone"
                      disabled={isSubmitting}
                      onPhoneChange={(value) =>
                        form.setValue("payer.phone", value || "", { shouldValidate: true })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle>Приемщик</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
                    <div className="space-y-2">
                      <Label htmlFor="receiver.lastName">Фамилия</Label>
                      <Input
                        className="rounded-2xl"
                        id="receiver.lastName"
                        placeholder="Петров"
                        disabled={isSubmitting}
                        {...form.register("receiver.lastName")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="receiver.firstName">Имя</Label>
                      <Input
                        className="rounded-2xl"
                        id="receiver.firstName"
                        placeholder="Петр"
                        disabled={isSubmitting}
                        {...form.register("receiver.firstName")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="receiver.middleName">Отчество</Label>
                      <Input
                        className="rounded-2xl"
                        id="receiver.middleName"
                        placeholder="Петрович"
                        disabled={isSubmitting}
                        {...form.register("receiver.middleName")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receiver.phone">Телефон</Label>
                    <InputPhone
                      className="rounded-2xl"
                      id="receiver.phone"
                      disabled={isSubmitting}
                      onPhoneChange={(value) =>
                        form.setValue("receiver.phone", value || "", { shouldValidate: true })
                      }
                    />
                  </div>
                </div>
              </CardContent>
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

          <Button
            type="button"
            disabled={isSubmitting}
            className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
            onClick={() => navigate({ to: "/clients" })}
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
      </form>
    </div>
  );
};
