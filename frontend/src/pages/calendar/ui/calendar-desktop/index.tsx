import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { useCallback, useEffect, useState } from "react";
import { DAYS_WEEK, HOURS, useCalendar } from "../../hooks";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, HomeIcon, MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeliveryBlock } from "./delivery-block";
import { Link } from "@tanstack/react-router";

// Desktop версия календаря
export const CalendarDesktop = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();

  const {
    deliveries,
    isLoading,
    error,
    formatWeekRange,
    formatTime,
    loadDeliveries,
    prevWeek,
    nextWeek,
    currentWeek,
  } = useCalendar(selectedDate);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const handlePrevWeek = () => {
    setSelectedDate((prev) => prevWeek(prev));
  };

  const handleNextWeek = () => {
    setSelectedDate((prev) => nextWeek(prev));
  };

  const handleCurrent = () => {
    setSelectedDate(currentWeek());
  };

  // Получаем deliveries для конкретного дня
  const getDeliveriesForDay = useCallback(
    (dayIndex: number) => {
      return deliveries
        .filter((d) => {
          const date = new Date(d.dateTime);
          const deliveryDay = date.getDay();
          const adjustedDay = deliveryDay === 0 ? 6 : deliveryDay - 1;
          return adjustedDay === dayIndex;
        })
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    },
    [deliveries],
  );

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          {/* Заголовок с навигацией */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>Календарь доставок</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCurrent}>
                Сегодня
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={handlePrevWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium w-48 text-center">{formatWeekRange}</span>
                <Button variant="outline" size="icon" onClick={handleNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isLoading && <div className="text-center py-8">Загрузка...</div>}
      {error && <div className="text-center py-8 text-red-500">{error}</div>}

      {!isLoading && !error && (
        <div className="border rounded-lg overflow-hidden bg-white">
          {/* Шапка с днями недели */}
          <div className="grid grid-cols-[70px_repeat(7,1fr)] border-b bg-zinc-50">
            <div className="py-2 text-center text-xs font-medium text-muted-foreground border-r whitespace-nowrap">
              Время
            </div>
            {DAYS_WEEK.map((day) => {
              // Вычисляем дату для этого дня
              const date = new Date(selectedDate);
              const currentDay = date.getDay() === 0 ? 6 : date.getDay() - 1;
              const targetDay = DAYS_WEEK.indexOf(day);
              const diff = targetDay - currentDay;
              const dayDate = new Date(date);
              dayDate.setDate(date.getDate() + diff);

              const today = new Date();
              const isToday =
                dayDate.getDate() === today.getDate() &&
                dayDate.getMonth() === today.getMonth() &&
                dayDate.getFullYear() === today.getFullYear();

              return (
                <div
                  key={day}
                  className={cn(
                    "p-3 text-center text-sm font-medium border-r",
                    isToday && "bg-blue-50 text-blue-600",
                  )}
                >
                  <div>{day}</div>
                  <div className={cn("text-lg", isToday && "font-bold")}>{dayDate.getDate()}</div>
                </div>
              );
            })}
          </div>

          {/* Часы с доставками */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[70px_repeat(7,1fr)] border-b hover:bg-zinc-50 transition-colors"
            >
              {/* Ячейка времени */}
              <div className="p-2 text-center text-xs text-muted-foreground border-r bg-zinc-50 whitespace-nowrap">
                {hour.toString().padStart(2, "0")}:00
              </div>
              {/* Ячейки дней */}
              {DAYS_WEEK.map((_, dayIndex) => {
                const dayDeliveries = getDeliveriesForDay(dayIndex);
                const hourDeliveries = dayDeliveries.filter((d) => {
                  const h = new Date(d.dateTime).getHours();
                  return h === hour;
                });

                return (
                  <div key={dayIndex} className="p-1 border-r min-h-[60px] relative">
                    {hourDeliveries.map((delivery) => (
                      <DeliveryBlock
                        key={delivery.id}
                        delivery={delivery}
                        time={formatTime(delivery.dateTime)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
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
