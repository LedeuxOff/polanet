import { Car, DeliveryWithIncome, User } from "@/lib/types";
import { paymentMethodLabels } from "../../../consts";
import { Button } from "@/components/ui/button";
import {
  BanknoteIcon,
  BoxIcon,
  CheckIcon,
  PencilIcon,
  Trash2Icon,
  TruckIcon,
  UserIcon,
  UserRoundCogIcon,
  WalletIcon,
} from "lucide-react";
import { cn, getFormattedAmount } from "@/lib/utils";
import {
  DeliveryComment,
  DeliveryDateBlock,
  DeliveryHistoryToggle,
  DeliveryInfoField,
  DeliveryStatusBadge,
} from "./delivery-card-parts";
import { getCarName, getDeliveryAmount, getDriverName, statusStyles } from "../utils";

interface Props {
  delivery: DeliveryWithIncome;
  drivers: User[];
  cars: Car[];
  handleCompleteDelivery: () => Promise<void>;
  handleChangeRecipient: () => void;
  handleEditDelivery: (delivery: DeliveryWithIncome) => void;
  disabledByStatus: boolean;
  handleDeleteDelivery: (deliveryId: number) => Promise<void>;
}

export const DeliveryMobileItem = ({
  delivery,
  drivers,
  cars,
  handleCompleteDelivery,
  handleChangeRecipient,
  handleEditDelivery,
  disabledByStatus,
  handleDeleteDelivery,
}: Props) => {
  const isCompleted = delivery.status === "completed";
  const actionsDisabled = isCompleted || disabledByStatus;
  const accent = (statusStyles[delivery.status] ?? statusStyles.in_progress).accent;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-l-4 p-3 dark:border-white/20",
        accent,
      )}
    >
      <div className="flex gap-3">
        <DeliveryDateBlock dateTime={delivery.dateTime} />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <span className="font-semibold">Доставка № {delivery.id}</span>
          <div className="flex flex-wrap gap-1.5">
            <DeliveryStatusBadge status={delivery.status} />
            {delivery.isPaymentBeforeUnloading && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                <CheckIcon className="h-3 w-3" /> До выгрузки
              </span>
            )}
          </div>
          <span className="text-lg font-bold">
            {getFormattedAmount(getDeliveryAmount(delivery))} ₽
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DeliveryInfoField
          icon={<UserIcon className="h-4 w-4" />}
          label="Водитель"
          value={getDriverName(drivers, delivery.driverId)}
        />
        <DeliveryInfoField
          icon={<TruckIcon className="h-4 w-4" />}
          label="Авто"
          value={getCarName(cars, delivery.carId)}
        />
        <DeliveryInfoField
          icon={<BoxIcon className="h-4 w-4" />}
          label="Объём"
          value={delivery.volume ? `${delivery.volume} м³` : "—"}
        />
        <DeliveryInfoField
          icon={<WalletIcon className="h-4 w-4" />}
          label="Оплата"
          value={paymentMethodLabels[delivery.paymentMethod]}
        />
      </div>

      {delivery.comment && <DeliveryComment comment={delivery.comment} />}

      <div className="flex gap-2">
        {delivery.status === "in_progress" && (
          <Button
            type="button"
            size="sm"
            onClick={() => handleCompleteDelivery()}
            className="flex-1 gap-1.5 rounded-xl bg-green-600 text-white hover:bg-green-700 dark:bg-green-600/40 dark:border dark:border-white/20 dark:hover:bg-green-600/60"
          >
            <BanknoteIcon className="h-4 w-4" /> Завершить
          </Button>
        )}
        {delivery.status === "completed" && (
          <Button
            type="button"
            size="sm"
            onClick={() => handleChangeRecipient()}
            className="flex-1 gap-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 hover:text-white dark:bg-blue-600/40 dark:border dark:border-white/20 dark:text-white dark:hover:bg-blue-600/60"
          >
            <UserRoundCogIcon className="h-4 w-4" /> Сменить получателя
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleEditDelivery(delivery)}
          disabled={actionsDisabled}
          className={cn(
            "gap-1.5 rounded-xl dark:border-white/20",
            delivery.status !== "in_progress" && "flex-1",
          )}
        >
          <PencilIcon className="h-4 w-4" />
          {delivery.status !== "in_progress" && "Редактировать"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleDeleteDelivery(delivery.id)}
          disabled={actionsDisabled}
          className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-white/20 dark:text-red-300 dark:hover:bg-red-500/20"
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </div>

      <DeliveryHistoryToggle
        deliveryId={delivery.id}
        refreshKey={`${delivery.income?.recipientId ?? ""}-${delivery.updatedAt}`}
      />
    </div>
  );
};
