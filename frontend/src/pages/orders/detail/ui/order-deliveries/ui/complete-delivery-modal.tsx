import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Car, DeliveryWithIncome, User } from "@/lib/types";
import { cn, getFormattedAmount } from "@/lib/utils";
import {
  BoxIcon,
  CalendarClockIcon,
  CreditCardIcon,
  TruckIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react";
import { paymentMethodLabels } from "../../../consts";
import { DeliveryComment, DeliveryInfoField } from "./delivery-card-parts";
import { getCarName, getDeliveryAmount, getDriverName } from "../utils";

interface Props {
  isMobile: boolean;
  mode: "complete" | "change-recipient";
  delivery: DeliveryWithIncome | null;
  onClose: () => void;
  onConfirm: (recipientId: number) => Promise<void>;
  drivers: User[];
  cars: Car[];
  users: User[];
  error: string | null;
}

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const glass = "rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20";

export const CompleteDeliveryModal = ({
  isMobile,
  mode,
  delivery,
  onClose,
  onConfirm,
  drivers,
  cars,
  users,
  error,
}: Props) => {
  const [recipientId, setRecipientId] = useState<number | undefined>();
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (delivery) {
      setRecipientId(delivery.income?.recipientId ?? delivery.recipientId ?? undefined);
      setTouched(false);
      setSubmitting(false);
    }
  }, [delivery]);

  const open = !!delivery;
  const recipientError = touched && !recipientId;

  const handleConfirm = async () => {
    setTouched(true);
    if (!recipientId) return;
    setSubmitting(true);
    try {
      await onConfirm(recipientId);
    } finally {
      setSubmitting(false);
    }
  };

  let body: ReactNode = null;
  if (delivery) {
    body = (
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
        )}

        <div className={cn("grid gap-x-4 gap-y-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
          <DeliveryInfoField
            icon={<UserIcon className="h-4 w-4" />}
            label="Водитель"
            value={getDriverName(drivers, delivery.driverId)}
          />
          <DeliveryInfoField
            icon={<TruckIcon className="h-4 w-4" />}
            label="Автомобиль"
            value={getCarName(cars, delivery.carId)}
          />
          <DeliveryInfoField
            icon={<CalendarClockIcon className="h-4 w-4" />}
            label="Дата и время"
            value={formatDateTime(delivery.dateTime)}
          />
          <DeliveryInfoField
            icon={<BoxIcon className="h-4 w-4" />}
            label="Объём груза"
            value={delivery.volume ? `${delivery.volume} м³` : "—"}
          />
          <DeliveryInfoField
            icon={<WalletIcon className="h-4 w-4" />}
            label="Стоимость"
            value={`${getFormattedAmount(getDeliveryAmount(delivery))} ₽`}
          />
          <DeliveryInfoField
            icon={<CreditCardIcon className="h-4 w-4" />}
            label="Тип оплаты"
            value={paymentMethodLabels[delivery.paymentMethod] ?? "—"}
          />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Комментарий
          </span>
          {delivery.comment ? (
            <DeliveryComment comment={delivery.comment} />
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </div>

        <div className="space-y-4 p-4 border rounded-2xl bg-muted/20 dark:border-white/20">
          <Label className="text-base font-semibold">Получатель средств</Label>
          <div className="space-y-2">
            <Label>Сотрудник *</Label>
            <Select
              value={recipientId ? String(recipientId) : ""}
              onValueChange={(value) => setRecipientId(Number(value))}
            >
              <SelectTrigger className={glass}>
                <SelectValue placeholder="Выберите сотрудника" />
              </SelectTrigger>
              <SelectContent className={glass}>
                {users.map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.lastName} {user.firstName} {user.middleName || ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {recipientError && (
              <p className="text-sm text-destructive">Выберите получателя средств</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const confirmButton = (
    <Button
      type="button"
      onClick={handleConfirm}
      disabled={submitting}
      className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-600/40 dark:border dark:border-white/20 dark:text-white dark:hover:bg-green-600/60"
    >
      {mode === "complete" ? "Завершить" : "Сменить получателя"}
    </Button>
  );

  const cancelButton = (
    <Button
      type="button"
      variant="outline"
      onClick={onClose}
      className="dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20 dark:text-white dark:hover:bg-white/20"
    >
      Отмена
    </Button>
  );

  const titlePrefix = mode === "complete" ? "Завершение доставки" : "Смена получателя · доставка";
  const title = delivery ? `${titlePrefix} № ${delivery.id}` : titlePrefix;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
        <DrawerContent className="dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 flex-1 max-h-[90vh] overflow-y-auto">
            {body}
            <div className="flex flex-col gap-4 pt-4 pb-8">
              {confirmButton}
              {cancelButton}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="!rounded-2xl max-w-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === "complete"
              ? "Проверьте данные и выберите получателя средств"
              : "Выберите нового получателя средств"}
          </DialogDescription>
        </DialogHeader>
        {body}
        <DialogFooter>
          {cancelButton}
          {confirmButton}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
