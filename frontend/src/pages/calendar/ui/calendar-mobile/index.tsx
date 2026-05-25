import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { useEffect, useState } from "react";
import { useCalendar } from "../../hooks";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { CalendarIcon, HomeIcon, MenuIcon } from "lucide-react";
import { DatePicker } from "./date-picker";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

// Mobile версия календаря
export const CalendarMobile = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();

  const { deliveries, isLoading, error, formatTime, loadDeliveries } = useCalendar(selectedDate);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

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

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      weekday: "long",
    };
    return date.toLocaleDateString("ru-RU", options);
  };

  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <Card>
        <CardHeader>
          {/* Заголовок с навигацией */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>Календарь доставок</CardTitle>
          </div>
        </CardHeader>
      </Card>

      {/* Дата */}
      <Card>
        <CardHeader>
          {/* Заголовок с навигацией */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>{formatDate(selectedDate)}</CardTitle>
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

      {/* Список доставок */}
      {isLoading && <div className="text-center py-8">Загрузка...</div>}
      {error && <div className="text-center py-8 text-red-500">{error}</div>}

      {!isLoading && !error && (
        <div className="space-y-3">
          {dayDeliveries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">На эту дату нет доставок</div>
          ) : (
            dayDeliveries.map((delivery) => {
              const driverName = delivery.driver
                ? `${delivery.driver.lastName} ${delivery.driver.firstName}`.trim()
                : "Не указан";

              const carInfo = delivery.car
                ? `${delivery.car.brand} (${delivery.car.licensePlate})`
                : "";

              const clientName = delivery.client
                ? `${delivery.client.firstName || ""} ${delivery.client.lastName || ""} ${delivery.client.organizationName || ""}`.trim()
                : delivery.order?.payerLastName
                  ? `${delivery.order.payerLastName} ${delivery.order.payerFirstName}`
                  : "Клиент не указан";

              return (
                <div
                  key={delivery.id}
                  className="bg-white rounded-lg p-4 border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 text-blue-800 rounded-lg px-3 py-2 text-center min-w-[60px]">
                      <div className="text-lg font-bold">{formatTime(delivery.dateTime)}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{driverName}</div>
                      {carInfo && <div className="text-sm text-muted-foreground">{carInfo}</div>}
                      <div className="text-sm text-muted-foreground truncate">{clientName}</div>
                      <div className="flex gap-2 mt-2">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            delivery.status === "in_progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800",
                          )}
                        >
                          {delivery.status === "in_progress" ? "В процессе" : "Завершена"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

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
