import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDelivery, Driver, User } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { Control, UseFormReturn } from "react-hook-form";
import { DeliveryCompleteForm } from "./use-add-delivery";

interface Props {
  showCompleteDialog: boolean;
  setShowCompleteDialog: Dispatch<SetStateAction<boolean>>;
  form: UseFormReturn<DeliveryCompleteForm>;
  control: Control<DeliveryCompleteForm>;
  editingDelivery: CalendarDelivery | null;
  handleSaveComplete: (data: DeliveryCompleteForm) => Promise<void>;
  handleCancelComplete: () => void;
  drivers: Driver[];
  users: User[];
  isChangingRecipient?: boolean;
}

export const CompleteDeliveryModal = ({
  showCompleteDialog,
  setShowCompleteDialog,
  form,
  handleSaveComplete,
  handleCancelComplete,
  drivers,
  users,
  isChangingRecipient = false,
}: Props) => {
  const recipientType = form.watch("recipientType");

  // Определяем заголовок и описание в зависимости от контекста
  const title = isChangingRecipient ? "Смена получателя средств" : "Завершение доставки";
  const description = isChangingRecipient
    ? "Измените данные о получателе средств"
    : "Заполните данные о получателе средств и завершите доставку";
  const submitButtonText = isChangingRecipient ? "Сохранить" : "Завершить доставку";

  return (
    <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSaveComplete)} className="space-y-4">
          <div className="space-y-2">
            <Label>Тип получателя</Label>
            <Select
              value={form.watch("recipientType") || ""}
              onValueChange={(value: "employee" | "driver") =>
                form.setValue("recipientType", value)
              }
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

          {recipientType === "employee" && (
            <div className="space-y-2">
              <Label>Сотрудник</Label>
              <Select
                value={String(form.watch("recipientId") || "")}
                onValueChange={(value) => form.setValue("recipientId", Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите сотрудника" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.lastName} {user.firstName} {user.middleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {recipientType === "driver" && (
            <div className="space-y-2">
              <Label>Водитель</Label>
              <Select
                value={String(form.watch("recipientId") || "")}
                onValueChange={(value) => form.setValue("recipientId", Number(value))}
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

          <div className="space-y-2">
            <Label>Комментарий</Label>
            <input
              type="text"
              {...form.register("comment")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Введите комментарий (необязательно)"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancelComplete}>
              Отмена
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
              {submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
