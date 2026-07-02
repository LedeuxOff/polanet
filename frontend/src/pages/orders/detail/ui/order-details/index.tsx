import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks";
import { OrderForm, getAvailableStatusTransitions, statusLabels } from "@/lib/types";
import { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<OrderForm>;
  isSubmitting: boolean;
  originalStatus: string | null;
  disabledByStatus: boolean;
}

export const OrderDetails = ({ form, isSubmitting, originalStatus, disabledByStatus }: Props) => {
  const isMobile = useIsMobile();
  const currentStatus = form.watch("status");
  const statusToUse = originalStatus || currentStatus;
  const availableTransitions = getAvailableStatusTransitions(statusToUse);

  // Combine current status with available transitions to ensure current status is always shown
  const allStatusOptions = Array.from(new Set([currentStatus, ...availableTransitions]));

  return (
    <div className="flex flex-col gap-4">
      {/* Тип, статус и дата и время */}
      <div className={`grid grid-cols-4 gap-4`}>
        <div className="col-span-4 md:col-span-2 space-y-2">
          <Label htmlFor="type">Тип заявки *</Label>
          <Select
            value={form.watch("type")}
            onValueChange={(value: "delivery" | "pickup") => form.setValue("type", value)}
            disabled={disabledByStatus}
          >
            <SelectTrigger disabled={isSubmitting} className="rounded-2xl">
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-xl">
              <SelectItem value="delivery">Доставка</SelectItem>
              <SelectItem value="pickup">Вывоз</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.type && (
            <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
          )}
        </div>

        <div className="col-span-4 md:col-span-2 space-y-2">
          <Label htmlFor="date">Дата *</Label>
          <Input
            className="rounded-2xl"
            id="date"
            type="date"
            disabled={isSubmitting || disabledByStatus}
            {...form.register("date")}
          />
          {form.formState.errors.date && (
            <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
          )}
        </div>

        <div className="col-span-4 md:col-span-2 space-y-2">
          <Label htmlFor="volume">Объем груза (м³)</Label>
          <Input
            className="rounded-2xl"
            id="volume"
            type="number"
            step="0.001"
            min="0"
            disabled={isSubmitting || disabledByStatus}
            {...form.register("volume", { valueAsNumber: true })}
          />
          {form.formState.errors.volume && (
            <p className="text-sm text-destructive">{form.formState.errors.volume.message}</p>
          )}
        </div>

        <div className="col-span-4 md:col-span-2 space-y-2">
          <Label htmlFor="status">Статус *</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(
              value: "new" | "in_progress" | "completed" | "cancelled" | "archived" | "draft",
            ) => form.setValue("status", value)}
            disabled={isSubmitting}
          >
            <SelectTrigger className="rounded-2xl">
              <SelectValue placeholder="Выберите статус" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-xl">
              {allStatusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabels[status] || status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.status && (
            <p className="text-sm text-destructive">{form.formState.errors.status.message}</p>
          )}
        </div>
      </div>

      {/* адрес и комментарий */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address">Адрес *</Label>
          <Textarea
            className="rounded-2xl"
            id="address"
            disabled={isSubmitting || disabledByStatus}
            {...form.register("address")}
            rows={2}
          />
          {form.formState.errors.address && (
            <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressComment">Комментарий к адресу</Label>
          <Textarea
            className="rounded-2xl"
            id="addressComment"
            disabled={isSubmitting || disabledByStatus}
            {...form.register("addressComment")}
            rows={2}
          />
        </div>
      </div>

      {/* Пропуск */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              disabled={isSubmitting || disabledByStatus}
              {...form.register("hasPass")}
              className="h-4 w-4"
            />
            Наличие пропуска
          </Label>
        </div>
      </div>
    </div>
  );
};
