import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Car, Delivery, DeliveryForm, Driver } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { UseFormReturn } from "react-hook-form";

interface Props {
  showDeliveryDialog: boolean;
  setShowDeliveryDialog: Dispatch<SetStateAction<boolean>>;
  form: UseFormReturn<DeliveryForm>;
  error: string | null;
  editingDelivery: Delivery | null;
  handleSaveDelivery: (data: DeliveryForm) => Promise<void>;
  drivers: Driver[];
  cars: Car[];
  handleCancelDelivery: () => void;
}

export const AddDeliveryMobileModal = ({
  showDeliveryDialog,
  setShowDeliveryDialog,
  editingDelivery,
  form,
  error,
  handleSaveDelivery,
  drivers,
  cars,
  handleCancelDelivery,
}: Props) => {
  return (
    <Drawer open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
      <DrawerContent className="">
        <DrawerHeader>
          <DrawerTitle>
            {editingDelivery ? "Редактирование доставки" : "Добавление доставки"}
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-2 flex-1 max-h-[90vh]">
          <form onSubmit={form.handleSubmit(handleSaveDelivery)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <div className={`grid grid-cols-1 gap-4`}>
              <div className="space-y-2">
                <Label>Водитель *</Label>
                <Select
                  value={String(form.watch("driverId") || "")}
                  onValueChange={(value) => form.setValue("driverId", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите водителя" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={String(driver.id)}>
                        {driver.lastName} {driver.firstName} {driver.middleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Автомобиль *</Label>
                <Select
                  value={String(form.watch("carId") || "")}
                  onValueChange={(value) => form.setValue("carId", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите автомобиль" />
                  </SelectTrigger>
                  <SelectContent>
                    {cars.map((car) => (
                      <SelectItem key={car.id} value={String(car.id)}>
                        {car.brand} ({car.licensePlate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className={`grid grid-cols-1 gap-4`}>
              <div className="space-y-2">
                <Label>Дата и время *</Label>
                <Input type="datetime-local" {...form.register("dateTime")} />
              </div>

              <div className="space-y-2">
                <Label>Объем груза (м³)</Label>
                <Input type="number" step="0.1" {...form.register("volume")} />
              </div>

              <div className="space-y-2">
                <Label>Стоимость *</Label>
                <Input type="number" {...form.register("amount")} />
                {form.formState.errors.amount && (
                  <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Комментарий</Label>
              <Textarea {...form.register("comment")} rows={2} />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Тип оплаты *</Label>
                <Select
                  value={form.watch("paymentMethod")}
                  onValueChange={(value: "cash" | "bank_transfer") =>
                    form.setValue("paymentMethod", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип оплаты" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Наличные</SelectItem>
                    <SelectItem value="bank_transfer">Безналичный расчет</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.paymentMethod && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.paymentMethod.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={form.watch("isPaid")}
                    onCheckedChange={(checked: boolean) => form.setValue("isPaid", checked)}
                  />
                  Оплата произведена
                </Label>
                {form.formState.errors.isPaid && (
                  <p className="text-sm text-destructive">{form.formState.errors.isPaid.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={form.watch("isPaymentBeforeUnloading")}
                  onCheckedChange={(checked: boolean) =>
                    form.setValue("isPaymentBeforeUnloading", checked)
                  }
                />
                Оплата до выгрузки
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={form.watch("notifyClient")}
                    onCheckedChange={(checked: boolean) => form.setValue("notifyClient", checked)}
                  />
                  Отправить уведомление клиенту
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={form.watch("notifyDriver")}
                    onCheckedChange={(checked: boolean) => form.setValue("notifyDriver", checked)}
                  />
                  Отправить уведомление водителю
                </Label>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-4 pb-8">
              <Button type="button" variant="outline" onClick={handleCancelDelivery}>
                Отмена
              </Button>
              <Button type="button" onClick={form.handleSubmit(handleSaveDelivery)}>
                {editingDelivery ? "Сохранить" : "Добавить"}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
