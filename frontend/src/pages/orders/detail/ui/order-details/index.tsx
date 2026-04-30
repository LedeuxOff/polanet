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
      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
        <div className="space-y-2">
          <Label htmlFor="type">Тип заявки *</Label>
          <Select
            value={form.watch("type")}
            onValueChange={(value: "delivery" | "pickup") => form.setValue("type", value)}
            disabled={disabledByStatus}
          >
            <SelectTrigger disabled={isSubmitting}>
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delivery">Доставка</SelectItem>
              <SelectItem value="pickup">Вывоз</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.type && (
            <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateTime">Дата и время *</Label>
          <Input
            id="dateTime"
            type="datetime-local"
            disabled={isSubmitting || disabledByStatus}
            {...form.register("dateTime")}
          />
          {form.formState.errors.dateTime && (
            <p className="text-sm text-destructive">{form.formState.errors.dateTime.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Статус *</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(
              value: "new" | "in_progress" | "completed" | "cancelled" | "archived" | "draft",
            ) => form.setValue("status", value)}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите статус" />
            </SelectTrigger>
            <SelectContent>
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

      {/* Дата и время, адрес и комментарий */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address">Адрес *</Label>
          <Textarea
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
