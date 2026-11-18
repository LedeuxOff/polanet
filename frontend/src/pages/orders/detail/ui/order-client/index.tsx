import { PackageCheckIcon, WalletIcon } from "lucide-react";
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
import { clientsApi } from "@/lib/api";
import { Client, OrderForm } from "@/lib/types";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<OrderForm>;
  isSubmitting: boolean;
  disabledByStatus: boolean;
}

export const OrderClient = ({ form, isSubmitting, disabledByStatus }: Props) => {
  const [clients, setClients] = useState<Client[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    Promise.all([
      clientsApi
        .list({ limit: 1000 })
        .then((res) => setClients(res.data || []))
        .catch(console.error),
    ]).catch(console.error);
  }, []);

  // Автозаполнение при выборе клиента
  const selectedClientId = form.watch("clientId");
  useEffect(() => {
    if (selectedClientId) {
      const selectedClient = clients.find((c) => c.id === selectedClientId);
      if (selectedClient) {
        // Заполняем плательщика
        if (selectedClient.payerLastName)
          form.setValue("payerLastName", selectedClient.payerLastName);
        if (selectedClient.payerFirstName)
          form.setValue("payerFirstName", selectedClient.payerFirstName);
        if (selectedClient.payerMiddleName)
          form.setValue("payerMiddleName", selectedClient.payerMiddleName);
        if (selectedClient.payerPhone)
          form.setValue(
            "payerPhone",
            selectedClient.payerPhone.replace(/\D/g, "").length === 11
              ? selectedClient.payerPhone
              : `+7 ${selectedClient.payerPhone?.slice(1) || ""}`,
          );

        // Заполняем приемщика
        if (selectedClient.receiverLastName)
          form.setValue("receiverLastName", selectedClient.receiverLastName);
        if (selectedClient.receiverFirstName)
          form.setValue("receiverFirstName", selectedClient.receiverFirstName);
        if (selectedClient.receiverMiddleName)
          form.setValue("receiverMiddleName", selectedClient.receiverMiddleName);
        if (selectedClient.receiverPhone)
          form.setValue(
            "receiverPhone",
            selectedClient.receiverPhone.replace(/\D/g, "").length === 11
              ? selectedClient.receiverPhone
              : `+7 ${selectedClient.receiverPhone?.slice(1) || ""}`,
          );
      }
    }
  }, [selectedClientId, clients, form.setValue]);

  return (
    <div className="flex flex-col gap-4">
      {/* Клиент */}
      <div className="space-y-2">
        <Label htmlFor="clientId">Клиент</Label>
        <Select
          value={String(form.watch("clientId") || "")}
          onValueChange={(value) => form.setValue("clientId", value ? Number(value) : null)}
        >
          <SelectTrigger
            disabled={isSubmitting || disabledByStatus}
            className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
          >
            <SelectValue placeholder="Не выбран" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
            {clients.map((client) => (
              <SelectItem key={client.id} value={String(client.id)}>
                {client.type === "individual"
                  ? `${client.lastName} ${client.firstName}`
                  : client.organizationName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Плательщик */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/15 dark:bg-white/5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300">
              <WalletIcon className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Плательщик
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">Оплачивает заявку</span>
            </div>
          </div>
          <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-4"} gap-4`}>
            <div className={`space-y-2 ${isMobile ? "col-span-1" : "col-span-2"}`}>
              <Label htmlFor="payerLastName">Фамилия *</Label>
              <Input
                className="rounded-2xl bg-white dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                id="payerLastName"
                disabled={isSubmitting || disabledByStatus}
                {...form.register("payerLastName")}
              />
              {form.formState.errors.payerLastName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.payerLastName.message}
                </p>
              )}
            </div>

            <div className={`space-y-2 ${isMobile ? "col-span-1" : "col-span-2"}`}>
              <Label htmlFor="payerFirstName">Имя *</Label>
              <Input
                className="rounded-2xl bg-white dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                id="payerFirstName"
                disabled={isSubmitting || disabledByStatus}
                {...form.register("payerFirstName")}
              />
              {form.formState.errors.payerFirstName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.payerFirstName.message}
                </p>
              )}
            </div>

            <div className={`space-y-2 ${isMobile ? "col-span-1" : "col-span-2"}`}>
              <Label htmlFor="payerMiddleName">Отчество</Label>
              <Input
                className="rounded-2xl bg-white dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                id="payerMiddleName"
                disabled={isSubmitting || disabledByStatus}
                {...form.register("payerMiddleName")}
              />
            </div>

            <div className={`space-y-2 ${isMobile ? "col-span-1" : "col-span-2"}`}>
              <Label htmlFor="payerPhone">Телефон</Label>
              <InputPhone
                className="rounded-2xl bg-white dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                id="payerPhone"
                disabled={isSubmitting || disabledByStatus}
                value={form.watch("payerPhone") || ""}
                onPhoneChange={(value) =>
                  form.setValue("payerPhone", value || undefined, { shouldValidate: true })
                }
              />
            </div>
          </div>
        </div>

        {/* Приемщик */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/15 dark:bg-white/5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300">
              <PackageCheckIcon className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Приёмщик</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Принимает груз на объекте
              </span>
            </div>
          </div>
          <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-4"} gap-4`}>
            <div className={`space-y-2 ${isMobile ? "col-span-1" : "col-span-2"}`}>
              <Label htmlFor="receiverLastName">Фамилия *</Label>
              <Input
                className="rounded-2xl bg-white dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                id="receiverLastName"
                disabled={isSubmitting || disabledByStatus}
                {...form.register("receiverLastName")}
              />
              {form.formState.errors.receiverLastName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.receiverLastName.message}
                </p>
              )}
            </div>

            <div className={`space-y-2 ${isMobile ? "col-span-1" : "col-span-2"}`}>
              <Label htmlFor="receiverFirstName">Имя *</Label>
              <Input
                className="rounded-2xl bg-white dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                id="receiverFirstName"
                disabled={isSubmitting || disabledByStatus}
                {...form.register("receiverFirstName")}
              />
              {form.formState.errors.receiverFirstName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.receiverFirstName.message}
                </p>
              )}
            </div>

            <div className={`space-y-2 ${isMobile ? "col-span-1" : "col-span-2"}`}>
              <Label htmlFor="receiverMiddleName">Отчество</Label>
              <Input
                className="rounded-2xl bg-white dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                id="receiverMiddleName"
                disabled={isSubmitting || disabledByStatus}
                {...form.register("receiverMiddleName")}
              />
            </div>

            <div className={`space-y-2 ${isMobile ? "col-span-1" : "col-span-2"}`}>
              <Label htmlFor="receiverPhone">Телефон</Label>
              <InputPhone
                className="rounded-2xl bg-white dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                id="receiverPhone"
                disabled={isSubmitting || disabledByStatus}
                value={form.watch("receiverPhone") || ""}
                onPhoneChange={(value) =>
                  form.setValue("receiverPhone", value || undefined, { shouldValidate: true })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
