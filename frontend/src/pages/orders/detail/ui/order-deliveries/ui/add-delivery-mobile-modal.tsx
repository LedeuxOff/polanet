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
import { Car, Delivery, DeliveryForm, Driver, User } from "@/lib/types";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
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
  users: User[];
  completingDelivery?: boolean;
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
  users,
  completingDelivery = false,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (editingDelivery) {
      setIsEditing(true);
      setIsComplete(editingDelivery.status === "completed");
    } else {
      setIsEditing(false);
      setIsComplete(false);
    }
  }, [editingDelivery]);

  const isReadOnly = isEditing && isComplete;

  const selectProps = isReadOnly ? { disabled: true as const } : {};
  const inputProps = isReadOnly ? { disabled: true as const } : {};
  const checkboxProps = isReadOnly ? { disabled: true as const } : {};

  // Получаем ID водителя из текущей доставки
  const recipientType = form.watch("recipientType");
  const isPaid = form.watch("isPaid");

  // Показываем поля получателя если isPaid = true или если мы в режиме завершения доставки
  const showRecipientFields = (isPaid || completingDelivery) && !isReadOnly;

  useEffect(() => {
    if (showDeliveryDialog && editingDelivery) {
      const dt = new Date(editingDelivery.dateTime);
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, "0");
      const day = String(dt.getDate()).padStart(2, "0");
      const hours = String(dt.getHours()).padStart(2, "0");
      const minutes = String(dt.getMinutes()).padStart(2, "0");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const income = (editingDelivery as any).income;

      form.reset({
        driverId: editingDelivery.driverId,
        carId: editingDelivery.carId,
        dateTime: `${year}-${month}-${day}T${hours}:${minutes}`,
        amount: income?.amount || editingDelivery.amount || 0,
        volume: editingDelivery.volume || undefined,
        comment: editingDelivery.comment || undefined,
        paymentMethod: editingDelivery.paymentMethod,
        isPaid: income?.isPaid || false,
        isPaymentBeforeUnloading: editingDelivery.isPaymentBeforeUnloading,
        notifyClient: editingDelivery.notifyClient,
        notifyDriver: editingDelivery.notifyDriver,
        recipientType: editingDelivery.recipientType || undefined,
        recipientId: editingDelivery.recipientId || undefined,
      });
    }
  }, [showDeliveryDialog, editingDelivery, form]);

  return (
    <Drawer open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
      <DrawerContent className="">
        <DrawerHeader>
          <DrawerTitle>
            {isEditing
              ? isComplete
                ? "Детали доставки (завершена)"
                : "Редактирование доставки"
              : "Добавление доставки"}
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-2 flex-1 max-h-[90vh] overflow-y-auto">
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
                  {...selectProps}
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
                  {...selectProps}
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
                <Input type="datetime-local" {...form.register("dateTime")} {...inputProps} />
              </div>

              <div className="space-y-2">
                <Label>Объем груза (м³)</Label>
                <Input type="number" step="0.1" {...form.register("volume")} {...inputProps} />
              </div>

              <div className="space-y-2">
                <Label>Стоимость *</Label>
                <Input type="number" {...form.register("amount")} {...inputProps} />
                {form.formState.errors.amount && (
                  <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Комментарий</Label>
              <Textarea {...form.register("comment")} rows={2} {...inputProps} />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Тип оплаты *</Label>
                <Select
                  value={form.watch("paymentMethod")}
                  onValueChange={(value: "cash" | "bank_transfer") =>
                    form.setValue("paymentMethod", value)
                  }
                  {...selectProps}
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
                    {...checkboxProps}
                  />
                  Оплата произведена
                </Label>
                {form.formState.errors.isPaid && (
                  <p className="text-sm text-destructive">{form.formState.errors.isPaid.message}</p>
                )}
              </div>
            </div>

            {/* Поля получателя средств - показываются только если isPaid = true */}
            {showRecipientFields && (
              <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                <Label className="text-base font-semibold">Получатель средств</Label>

                <div className="space-y-2">
                  <Label>Тип получателя *</Label>
                  <Select
                    value={recipientType || ""}
                    onValueChange={(value: "employee" | "driver") =>
                      form.setValue("recipientType", value)
                    }
                    {...selectProps}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип получателя" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Сотрудник</SelectItem>
                      <SelectItem value="driver">Водитель</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Поле выбора сотрудника/водителя в зависимости от типа */}
                {recipientType === "employee" && (
                  <div className="space-y-2">
                    <Label>Сотрудник *</Label>
                    <Select
                      value={String(form.watch("recipientId") || "")}
                      onValueChange={(value) => form.setValue("recipientId", Number(value))}
                      {...selectProps}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите сотрудника" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={String(user.id)}>
                            {user.lastName} {user.firstName} {user.middleName || ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {recipientType === "driver" && (
                  <div className="space-y-2">
                    <Label>Водитель *</Label>
                    <Select
                      value={String(form.watch("recipientId") || "")}
                      onValueChange={(value) => form.setValue("recipientId", Number(value))}
                      {...selectProps}
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
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={form.watch("isPaymentBeforeUnloading")}
                  onCheckedChange={(checked: boolean) =>
                    form.setValue("isPaymentBeforeUnloading", checked)
                  }
                  {...checkboxProps}
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
                    {...checkboxProps}
                  />
                  Отправить уведомление клиенту
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={form.watch("notifyDriver")}
                    onCheckedChange={(checked: boolean) => form.setValue("notifyDriver", checked)}
                    {...checkboxProps}
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
              {!isComplete && isEditing && (
                <Button
                  type="button"
                  onClick={async () => {
                    try {
                      await handleSaveDelivery(form.getValues());
                    } catch (error) {
                      console.error("Error saving delivery:", error);
                    }
                  }}
                  className={
                    completingDelivery
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }
                >
                  {completingDelivery ? "Завершить и выбрать получателя" : "Завершить доставку"}
                </Button>
              )}
              {isEditing && !isComplete && !completingDelivery && (
                <Button type="submit">Сохранить</Button>
              )}
              {!isEditing && <Button type="submit">Добавить</Button>}
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
