import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Car, CalendarDelivery, DeliveryForm, Order, User } from "@/lib/types";
import { Dispatch, SetStateAction, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { CheckCircleIcon, Edit3Icon } from "lucide-react";

interface Props {
  showDeliveryDialog: boolean;
  setShowDeliveryDialog: Dispatch<SetStateAction<boolean>>;
  form: UseFormReturn<DeliveryForm>;
  error: string | null;
  editingDelivery: CalendarDelivery | null;
  handleSaveDelivery: (data: DeliveryForm) => Promise<void>;
  handleCompleteDelivery: () => Promise<void>;
  handleChangeRecipient: () => void;
  drivers: User[];
  cars: Car[];
  availableOrders: Order[];
  handleCancelDelivery: () => void;
  users: User[];
  completingDelivery?: boolean;
  setCompletingDelivery?: Dispatch<SetStateAction<boolean>>;
  isChangingRecipient?: boolean;
}

const isDeliveryComplete = (delivery: CalendarDelivery | null): boolean => {
  return delivery?.status === "completed";
};

export const AddDeliveryModal = ({
  showDeliveryDialog,
  setShowDeliveryDialog,
  editingDelivery,
  form,
  error,
  handleSaveDelivery,
  handleCompleteDelivery,
  handleChangeRecipient,
  drivers,
  cars,
  availableOrders,
  handleCancelDelivery,
  users,
  completingDelivery = false,
  setCompletingDelivery,
  isChangingRecipient = false,
}: Props) => {
  const isEditing = !!editingDelivery;
  const isComplete = isDeliveryComplete(editingDelivery);
  const isReadOnly = isEditing && isComplete;
  const isViewingExisting = isEditing && !isComplete;

  const selectProps = isReadOnly || isViewingExisting ? { disabled: true as const } : {};
  const inputProps = isReadOnly || isViewingExisting ? { disabled: true as const } : {};
  const checkboxProps = isReadOnly || isViewingExisting ? { disabled: true as const } : {};

  // Получаем isPaid из editingDelivery для существующих доставок
  const deliveryIsPaid = editingDelivery?.income?.isPaid ?? false;
  const formIsPaid = form.watch("isPaid");
  const isPaid = isEditing ? deliveryIsPaid : formIsPaid;

  // Получаем recipientId из income для существующих доставок
  const recipientId =
    isEditing && editingDelivery?.income?.recipientId != null
      ? editingDelivery.income.recipientId
      : form.watch("recipientId") || "";

  // Показываем поля получателя если isPaid = true или если мы в режиме завершения доставки
  const showRecipientFields = (isPaid && !isViewingExisting) || completingDelivery;

  useEffect(() => {
    if (showDeliveryDialog && !editingDelivery) {
      // Reset form when creating a new delivery
      form.reset({
        amount: 0,
        paymentMethod: "cash",
        isPaid: false,
        isPaymentBeforeUnloading: false,
        notifyClient: false,
        notifyDriver: false,
      });
    }
  }, [showDeliveryDialog, editingDelivery, form]);

  return (
    <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isChangingRecipient
              ? "Смена получателя средств"
              : isEditing
                ? isComplete
                  ? "Детали доставки (завершена)"
                  : "Редактирование доставки"
                : "Добавление доставки"}
          </DialogTitle>
          <DialogDescription>
            {isChangingRecipient
              ? "Измените данные о получателе средств"
              : isEditing
                ? isComplete
                  ? "Эта доставка завершена"
                  : `Статус: ${isComplete ? "Завершена" : "В процессе"}`
                : "Заполните данные о доставке"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSaveDelivery)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
          )}

          {/* Поле выбора заявки */}
          <div className="space-y-2">
            <Label>Заявка {isEditing ? "" : "*"}</Label>
            <Select
              value={String(form.watch("orderId") || "")}
              onValueChange={(value) => form.setValue("orderId", Number(value))}
              {...selectProps}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите заявку" />
              </SelectTrigger>
              <SelectContent>
                {availableOrders.map((order) => (
                  <SelectItem key={order.id} value={String(order.id)}>
                    {order.id} - {order.receiverLastName} {order.receiverFirstName} ({order.address}
                    )
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.orderId && (
              <p className="text-sm text-destructive">{form.formState.errors.orderId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Водитель {isEditing ? "" : "*"}</Label>
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
              <Label>Автомобиль {isEditing ? "" : "*"}</Label>
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Дата и время {isEditing ? "" : "*"}</Label>
              <Input type="datetime-local" {...form.register("dateTime")} {...inputProps} />
            </div>

            <div className="space-y-2">
              <Label>Объем груза (м³)</Label>
              <Input type="number" step="0.1" {...form.register("volume")} {...inputProps} />
            </div>

            <div className="space-y-2">
              <Label>Стоимость {isEditing ? "" : "*"}</Label>
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
              <Label>Тип оплаты {isEditing ? "" : "*"}</Label>
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
                  <SelectItem value="bank_transfer">Безличный расчет</SelectItem>
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
                <Label>Сотрудник *</Label>
                <Select
                  value={String(recipientId || "")}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancelDelivery}>
              Закрыть
            </Button>
            {!isComplete && isEditing && !completingDelivery && (
              <Button
                type="button"
                onClick={handleCompleteDelivery}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Завершить доставку
              </Button>
            )}
            {/* Кнопка смены получателя для завершенной доставки */}
            {isComplete && isEditing && (
              <Button
                type="button"
                onClick={handleChangeRecipient}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit3Icon className="w-4 h-4 mr-2" />
                Сменить получателя
              </Button>
            )}
            {!isEditing && <Button type="submit">Добавить</Button>}
            {completingDelivery && (
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                {isChangingRecipient ? "Сохранить" : "Сохранить и завершить"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
