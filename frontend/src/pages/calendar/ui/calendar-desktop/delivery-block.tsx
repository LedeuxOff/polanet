import { CalendarDelivery } from "@/lib/types";
import { GripVertical } from "lucide-react";

// Компонент блока доставки
interface DeliveryBlockProps {
  delivery: CalendarDelivery;
  time: string;
  onEdit?: (delivery: CalendarDelivery) => void;
  onDragStart?: (delivery: CalendarDelivery) => void;
  isDragDisabled?: boolean;
}

const getStatusLabel = (status: string): string => {
  switch (status) {
    case "in_progress":
      return "В процессе";
    case "completed":
      return "Завершена";
    default:
      return status;
  }
};

const getStatusColors = (
  status: string,
): { bg: string; border: string; text: string; textDark: string } => {
  switch (status) {
    case "in_progress":
      return {
        bg: "bg-yellow-100",
        border: "border-yellow-500",
        text: "text-yellow-800",
        textDark: "text-yellow-700",
      };
    case "completed":
      return {
        bg: "bg-green-100",
        border: "border-green-500",
        text: "text-green-800",
        textDark: "text-green-700",
      };
    default:
      return {
        bg: "bg-blue-100",
        border: "border-blue-500",
        text: "text-blue-800",
        textDark: "text-blue-700",
      };
  }
};

export const DeliveryBlock = ({
  delivery,
  time,
  onEdit,
  onDragStart,
  isDragDisabled = false,
}: DeliveryBlockProps) => {
  const driverName = delivery.driver
    ? `${delivery.driver.lastName} ${delivery.driver.firstName}`.trim()
    : "Не указан";

  const carInfo = delivery.car ? `${delivery.car.brand} (${delivery.car.licensePlate})` : "";

  const clientName = delivery.client
    ? `${delivery.client.firstName || ""} ${delivery.client.lastName || ""} ${delivery.client.organizationName || ""}`.trim()
    : delivery.order?.payerLastName
      ? `${delivery.order.payerLastName} ${delivery.order.payerFirstName}`
      : "Клиент не указан";

  const statusLabel = getStatusLabel(delivery.status);
  const colors = getStatusColors(delivery.status);

  const handleClick = () => {
    if (onEdit) {
      onEdit(delivery);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isDragDisabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("deliveryId", String(delivery.id));
    e.dataTransfer.effectAllowed = "move";
    // Используем offset от текущей позиции мыши относительно элемента
    e.dataTransfer.setDragImage(
      e.currentTarget as HTMLElement,
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY,
    );
    if (onDragStart) {
      onDragStart(delivery);
    }
  };

  return (
    <div
      className={`${colors.bg} border-l-4 ${colors.border} rounded p-2 mb-1 text-xs cursor-pointer hover:opacity-80 transition-opacity ${
        isDragDisabled ? "opacity-70" : "cursor-grab active:cursor-grabbing"
      } ${isDragDisabled ? "cursor-pointer" : ""}`}
      onClick={handleClick}
      draggable={!isDragDisabled}
      onDragStart={handleDragStart}
    >
      <div className="flex items-center gap-1 mb-1">
        {!isDragDisabled && <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />}
        <div className="font-medium text-blue-900 truncate">{time}</div>
      </div>
      <div className={`${colors.text} truncate`}>{driverName}</div>
      {carInfo && <div className={colors.textDark + " truncate"}>{carInfo}</div>}
      <div className={colors.textDark + " truncate"}>{clientName}</div>
      <div className={`${colors.text} font-medium mt-1`}>
        <span className="inline-block px-2 py-0.5 rounded-full bg-white/50 text-xs">
          {statusLabel}
        </span>
      </div>
    </div>
  );
};
