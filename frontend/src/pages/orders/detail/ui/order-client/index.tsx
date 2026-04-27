import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clientsApi } from "@/lib/api";
import { Client, OrderForm } from "@/lib/types";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<OrderForm>;
  isSubmitting: boolean;
}

export const OrderClient = ({ form, isSubmitting }: Props) => {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    Promise.all([clientsApi.list().then(setClients).catch(console.error)]).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Клиент */}
      <div className="space-y-2">
        <Label htmlFor="clientId">Клиент</Label>
        <Select
          value={String(form.watch("clientId") || "")}
          onValueChange={(value) => form.setValue("clientId", value ? Number(value) : null)}
        >
          <SelectTrigger disabled={isSubmitting}>
            <SelectValue placeholder="Не выбран" />
          </SelectTrigger>
          <SelectContent>
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

      {/* Плательщик */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Плательщик</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="payerLastName">Фамилия *</Label>
            <Input id="payerLastName" disabled={isSubmitting} {...form.register("payerLastName")} />
            {form.formState.errors.payerLastName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.payerLastName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payerFirstName">Имя *</Label>
            <Input
              id="payerFirstName"
              disabled={isSubmitting}
              {...form.register("payerFirstName")}
            />
            {form.formState.errors.payerFirstName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.payerFirstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payerMiddleName">Отчество</Label>
            <Input
              id="payerMiddleName"
              disabled={isSubmitting}
              {...form.register("payerMiddleName")}
            />
          </div>
        </div>
      </div>

      {/* Приемщик */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Приемщик</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="receiverLastName">Фамилия *</Label>
            <Input
              id="receiverLastName"
              disabled={isSubmitting}
              {...form.register("receiverLastName")}
            />
            {form.formState.errors.receiverLastName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.receiverLastName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiverFirstName">Имя *</Label>
            <Input
              id="receiverFirstName"
              disabled={isSubmitting}
              {...form.register("receiverFirstName")}
            />
            {form.formState.errors.receiverFirstName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.receiverFirstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiverMiddleName">Отчество</Label>
            <Input
              id="receiverMiddleName"
              disabled={isSubmitting}
              {...form.register("receiverMiddleName")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
