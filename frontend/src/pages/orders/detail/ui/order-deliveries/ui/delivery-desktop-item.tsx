import { Badge } from "@/components/ui/badge";
import { DeliveryWithIncome } from "@/lib/types";
import { deliveryStatusLabels, paymentMethodLabels } from "../../../consts";
import { Button } from "@/components/ui/button";
import {
  BadgeRussianRubleIcon,
  BanknoteIcon,
  CalendarIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  WeightIcon,
} from "lucide-react";
import { getFormattedAmount } from "@/lib/utils";

interface Props {
  delivery: DeliveryWithIncome;
  handleCompleteDelivery: (deliveryId: number) => Promise<void>;
  handleEditDelivery: (delivery: DeliveryWithIncome) => void;
  disabledByStatus: boolean;
  handleDeleteDelivery: (deliveryId: number) => Promise<void>;
}

export const DeliveryDesktopItem = ({
  delivery,
  handleCompleteDelivery,
  handleEditDelivery,
  disabledByStatus,
  handleDeleteDelivery,
}: Props) => {
  return (
    <div className="flex flex-col gap-4 border rounded-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <Badge
            className={
              delivery.status === "completed"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }
          >
            {deliveryStatusLabels[delivery.status]}
          </Badge>
          <Badge variant="outline">Номер доставки: {delivery.id}</Badge>
        </div>

        <div className="flex items-center gap-2">
          {delivery.status === "in_progress" && (
            <Button
              variant="default"
              size="sm"
              type="button"
              onClick={() => handleCompleteDelivery(delivery.id)}
              className="bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 flex items-center gap-2"
            >
              <BanknoteIcon /> Завершить
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleEditDelivery(delivery)}
            disabled={delivery.status === "completed" || disabledByStatus}
            className="bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            type="button"
            size="sm"
            onClick={() => handleDeleteDelivery(delivery.id)}
            disabled={delivery.status === "completed" || disabledByStatus}
            className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <BadgeRussianRubleIcon className="w-4 h-4" />
            <span>{getFormattedAmount(delivery.income?.amount)} ₽</span>
            <span>{paymentMethodLabels[delivery.paymentMethod]}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <WeightIcon className="w-4 h-4" />
            <span>{delivery.volume ? `${delivery.volume} м³` : "N/A"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <CalendarIcon className="w-4 h-4" />
          <span>{new Date(delivery.dateTime).toLocaleString("ru-RU")}</span>
        </div>

        {delivery.isPaymentBeforeUnloading && (
          <div className="flex items-center gap-2 text-gray-600">
            <CheckIcon className="w-4 h-4" />
            <span>Оплата до выгрузки</span>
          </div>
        )}
      </div>

      {delivery.comment && (
        <div className="flex flex-col gap-2">
          <span>Комментарий</span>
          <span className="text-muted-foreground">{delivery.comment}</span>
        </div>
      )}
    </div>
  );
};
