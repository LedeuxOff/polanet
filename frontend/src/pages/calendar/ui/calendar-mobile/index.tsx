import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { useEffect, useState, useCallback } from "react";
import { HOURS, useCalendar } from "../../hooks";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { CalendarIcon, HomeIcon, MenuIcon, PlusIcon, BanIcon } from "lucide-react";
import { DatePicker } from "./date-picker";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import type { CalendarDelivery } from "@/lib/types";
import { useAddDelivery } from "../calendar-desktop/use-add-delivery";
import { AddDeliveryDrawer } from "./add-delivery-drawer";

// Компонент блока доставки для мобильной версии
interface DeliveryBlockProps {
  delivery: CalendarDelivery;
  time: string;
  onEdit?: (delivery: CalendarDelivery) => void;
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

function DeliveryBlock({ delivery, time, onEdit }: DeliveryBlockProps) {
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

  return (
    <div
      className={`${colors.bg} border-l-4 ${colors.border} rounded p-2 mb-1 text-xs cursor-pointer hover:opacity-80 transition-opacity`}
      onClick={handleClick}
    >
      <div className="font-medium text-blue-900">{time}</div>
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
}

// Mobile версия календаря
export const CalendarMobile = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [deliveryData, setDeliveryData] = useState<{
    selectedDate: Date;
    selectedHour: number;
  } | null>(null);

  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();

  const { deliveries, isLoading, error, formatTime, loadDeliveries } = useCalendar(selectedDate);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const handleDeliveryCreated = useCallback(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const {
    showDeliveryDialog,
    setShowDeliveryDialog,
    form,
    error: formError,
    editingDelivery,
    handleCancelDelivery,
    handleEditDelivery,
    handleSaveDelivery,
    handleCompleteDelivery,
    handleChangeRecipient,
    drivers,
    cars,
    availableOrders,
    users,
    completingDelivery,
    isChangingRecipient,
  } = useAddDelivery({
    initialData: deliveryData || undefined,
    onDeliveryCreated: handleDeliveryCreated,
  });

  // Reset initial data after dialog is shown
  useEffect(() => {
    if (showDeliveryDialog && deliveryData) {
      setDeliveryData(null);
    }
  }, [showDeliveryDialog, deliveryData]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  // Получаем доставки для выбранной даты
  const dayDeliveries = deliveries
    .filter((d) => {
      const date = new Date(d.dateTime);
      return (
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()
      );
    })
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  // Группируем доставки по часам
  const deliveriesByHour: Record<number, CalendarDelivery[]> = {};
  HOURS.forEach((hour) => {
    deliveriesByHour[hour] = dayDeliveries.filter((d) => new Date(d.dateTime).getHours() === hour);
  });

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      weekday: "long",
    };
    return date.toLocaleDateString("ru-RU", options);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleCellClick = (hour: number) => {
    const dt = new Date(selectedDate);
    dt.setHours(hour, 0, 0, 0);
    setDeliveryData({ selectedDate: dt, selectedHour: hour });
  };

  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>Календарь доставок</CardTitle>
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Выберите дату</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">
                  <DatePicker
                    selectedDate={selectedDate}
                    onSelectDate={handleSelectDate}
                    onClose={() => setIsOpen(false)}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </CardHeader>
      </Card>

      {/* Календарь с колонками времени и даты */}
      {isLoading && <div className="text-center py-8">Загрузка...</div>}
      {error && <div className="text-center py-8 text-red-500">{error}</div>}

      {!isLoading && !error && (
        <div className="border rounded-lg overflow-hidden bg-white">
          {/* Шапка с датой */}
          <div className="grid grid-cols-[70px_1fr] border-b bg-zinc-50">
            <div className="py-2 px-1 text-center text-xs font-medium text-muted-foreground border-r">
              Время
            </div>
            <div
              className={cn(
                "p-3 text-center text-sm font-medium border-r",
                isToday(selectedDate) && "bg-blue-50 text-blue-600",
              )}
            >
              <div>{selectedDate.toLocaleDateString("ru-RU", { weekday: "short" })}</div>
              <div className={cn("text-lg", isToday(selectedDate) && "font-bold")}>
                {selectedDate.getDate()}
              </div>
            </div>
          </div>

          {/* Часы с доставками */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[70px_1fr] border-b hover:bg-zinc-50 transition-colors"
            >
              {/* Ячейка времени */}
              <div className="p-2 text-center text-xs text-muted-foreground border-r bg-zinc-50 whitespace-nowrap">
                {hour.toString().padStart(2, "0")}:00
              </div>
              {/* Ячейка с доставками */}
              <div className="relative p-1 min-h-[60px]">
                {deliveriesByHour[hour]?.map((delivery) => (
                  <DeliveryBlock
                    key={delivery.id}
                    delivery={delivery}
                    time={formatTime(delivery.dateTime)}
                    onEdit={handleEditDelivery}
                  />
                ))}

                {/* Иконки по центру ячейки (только если нет доставки) */}
                {!deliveriesByHour[hour]?.length && (
                  <>
                    {(() => {
                      const cellDate = new Date(selectedDate);
                      cellDate.setHours(hour, 0, 0, 0);
                      const isPast = cellDate <= new Date();

                      return (
                        <div
                          className={cn(
                            "absolute inset-0 flex items-center justify-center z-10",
                            !isPast && "opacity-0 group-hover:opacity-100",
                            !isPast && "hover:opacity-100",
                          )}
                          onClick={() => {
                            if (!isPast) {
                              handleCellClick(hour);
                            }
                          }}
                        >
                          {isPast ? (
                            <BanIcon className="h-12 w-12 text-gray-400/40" />
                          ) : (
                            <PlusIcon className="h-12 w-12 text-gray-400/40" />
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer добавления доставки */}
      <AddDeliveryDrawer
        showDeliveryDrawer={showDeliveryDialog}
        setShowDeliveryDrawer={setShowDeliveryDialog}
        form={form}
        error={formError}
        editingDelivery={editingDelivery}
        handleSaveDelivery={handleSaveDelivery}
        handleCompleteDelivery={handleCompleteDelivery}
        handleChangeRecipient={handleChangeRecipient}
        drivers={drivers}
        cars={cars}
        availableOrders={availableOrders}
        users={users}
        handleCancelDelivery={handleCancelDelivery}
        completingDelivery={completingDelivery}
        isChangingRecipient={isChangingRecipient}
      />

      <div
        className={`fixed ${isMobile ? "bottom-2" : "bottom-8"} left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md`}
      >
        <Link to="/">
          <Button
            type="button"
            className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900 flex gap-2"
          >
            <HomeIcon className="w-4 h-4" /> Главная
          </Button>
        </Link>

        {isMobile && (
          <Button
            type="button"
            className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
            onClick={() => setOpen(true)}
          >
            <MenuIcon className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
