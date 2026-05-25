import { CalendarDelivery } from "@/lib/types";

// Компонент блока доставки
interface DeliveryBlockProps {
  delivery: CalendarDelivery;
  time: string;
}

export const DeliveryBlock = ({ delivery, time }: DeliveryBlockProps) => {
  const driverName = delivery.driver
    ? `${delivery.driver.lastName} ${delivery.driver.firstName}`.trim()
    : "Не указан";

  const carInfo = delivery.car ? `${delivery.car.brand} (${delivery.car.licensePlate})` : "";

  const clientName = delivery.client
    ? `${delivery.client.firstName || ""} ${delivery.client.lastName || ""} ${delivery.client.organizationName || ""}`.trim()
    : delivery.order?.payerLastName
      ? `${delivery.order.payerLastName} ${delivery.order.payerFirstName}`
      : "Клиент не указан";

  return (
    <div className="bg-blue-100 border-l-4 border-blue-500 rounded p-2 mb-1 text-xs cursor-pointer hover:bg-blue-200 transition-colors">
      <div className="font-medium text-blue-900">{time}</div>
      <div className="text-blue-800 truncate">{driverName}</div>
      {carInfo && <div className="text-blue-700 truncate">{carInfo}</div>}
      <div className="text-blue-700 truncate">{clientName}</div>
    </div>
  );
};
