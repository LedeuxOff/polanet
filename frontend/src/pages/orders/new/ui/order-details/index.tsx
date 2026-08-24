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
import { NewOrderForm, getAvailableStatusTransitions, statusLabels } from "@/lib/types";
import { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<NewOrderForm>;
  isSubmitting: boolean;
}

export const NewOrderDetails = ({ form, isSubmitting }: Props) => {
  const isMobile = useIsMobile();
  const availableTransitions = getAvailableStatusTransitions(undefined);

  return (
    <div className="flex flex-col gap-4">
      {/* Тип, статус и дата и время */}
      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-4"} gap-4`}>
        <div className={`space-y-2 ${isMobile ? "col-span-1" : "col-span-2"}`}>
          <Label htmlFor="type">Тип заявки *</Label>
          <Select
            value={form.watch("type")}
            onValueChange={(value: "delivery" | "pickup") => form.setValue("type", value)}
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

        <div className={`space-y-2 ${isMobile ? "col-span-1" : "col-span-2"}`}>
          <Label htmlFor="date">Дата *</Label>
          <Input
            className="rounded-2xl"
            id="date"
            type="date"
            disabled={isSubmitting}
            {...form.register("date")}
          />
          {form.formState.errors.date && (
            <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
          )}
        </div>

        <div className={`space-y-2 ${isMobile ? "col-span-1" : "col-span-2"}`}>
          <Label htmlFor="volume">Объем груза (м³)</Label>
          <Input
            className="rounded-2xl"
            id="volume"
            type="number"
            step="0.001"
            min="0"
            disabled={isSubmitting}
            {...form.register("volume", { valueAsNumber: true })}
          />
          {form.formState.errors.volume && (
            <p className="text-sm text-destructive">{form.formState.errors.volume.message}</p>
          )}
        </div>

        <div className={`space-y-2 ${isMobile ? "col-span-1" : "col-span-2"}`}>
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
              {availableTransitions.map((status) => (
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

      {/* Объем груза, адрес и комментарий */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address">Адрес *</Label>
          <Textarea
            className="rounded-2xl"
            id="address"
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
              disabled={isSubmitting}
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
