import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { useCallback, useEffect, useRef, useState } from "react";
import { DAYS_WEEK, HOURS, useCalendar } from "../../hooks";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  HomeIcon,
  PlusIcon,
  BanIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarDelivery } from "@/lib/types";
import { deliveriesApi } from "@/lib/api";
import { DeliveryBlock } from "./delivery-block";
import { Link } from "@tanstack/react-router";
import { useAddDelivery } from "./use-add-delivery";
import { AddDeliveryModal } from "./add-delivery-modal";
import { CompleteDeliveryModal } from "./complete-delivery-modal";

// Desktop версия календаря
export const CalendarDesktop = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [deliveryData, setDeliveryData] = useState<{
    selectedDate: Date;
    selectedHour: number;
    draggedDelivery?: CalendarDelivery;
  } | null>(null);
  const [draggedDelivery, setDraggedDelivery] = useState<CalendarDelivery | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverCell, setDragOverCell] = useState<{ dayIndex: number; hour: number } | null>(null);
  // Ref to always have access to the latest dragged delivery in closures
  const draggedDeliveryRef = useRef<CalendarDelivery | null>(null);
  useEffect(() => {
    draggedDeliveryRef.current = draggedDelivery;
  }, [draggedDelivery]);

  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();

  const {
    deliveries,
    isLoading,
    error: calendarError,
    formatWeekRange,
    formatTime,
    loadDeliveries,
    updateDeliveryInList,
    prevWeek,
    nextWeek,
    currentWeek,
  } = useCalendar(selectedDate);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const handleDeliveryCreated = useCallback(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  // Проверка: можно ли создавать доставку в прошедшую ячейку
  const canCreateInCell = (cellDate: Date): boolean => {
    const now = new Date();
    return cellDate > now;
  };

  // Обработчик начала перетаскивания
  const handleDragStart = useCallback((delivery: CalendarDelivery) => {
    setDraggedDelivery(delivery);
    setIsDragging(true);
    setDragOverCell(null);
  }, []);

  // Обработчик перетаскивания над ячейкой
  const handleDragOver = useCallback(
    (dayIndex: number, hour: number) => (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverCell({ dayIndex, hour });
    },
    [],
  );

  // Вычисляем понедельник текущей недели
  const getMonday = useCallback((date: Date): Date => {
    const d = new Date(date);
    const dayOfWeek = d.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    d.setDate(d.getDate() + mondayOffset);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Обработчик drop на ячейку
  const handleDrop = useCallback(
    async (dayIndex: number, hour: number) => {
      // Используем ref чтобы избежать stale closure
      const delivery = draggedDeliveryRef.current;
      if (!delivery) return;

      // Вычисляем дату для этой ячейки: начинаем с понедельника текущей недели и добавляем dayIndex
      const monday = getMonday(selectedDate);
      const cellDate = new Date(monday);
      cellDate.setDate(monday.getDate() + dayIndex);
      cellDate.setHours(hour, 0, 0, 0);

      // Проверяем, можно ли создавать доставку в эту ячейку (не прошедшая)
      if (!canCreateInCell(cellDate)) {
        console.error("Нельзя переместить в прошедшее время");
        setDraggedDelivery(null);
        setIsDragging(false);
        setDragOverCell(null);
        return;
      }

      // Создаем новую дату/время для доставки
      // cellDate уже содержит правильную дату и час из целевой ячейки
      const existingDateTime = new Date(delivery.dateTime);
      const newDateTime = new Date(cellDate);
      newDateTime.setMinutes(existingDateTime.getMinutes()); // Сохраняем минуты из оригинальной доставки

      const newDateTimeStr = `${newDateTime.getFullYear()}-${String(newDateTime.getMonth() + 1).padStart(2, "0")}-${String(newDateTime.getDate()).padStart(2, "0")}T${String(newDateTime.getHours()).padStart(2, "0")}:${String(newDateTime.getMinutes()).padStart(2, "0")}`;

      // Оптимистичное обновление: сразу обновляем локальное состояние
      const updatedDelivery: CalendarDelivery = {
        ...delivery,
        dateTime: newDateTimeStr,
      };

      try {
        // Фактически перемещаем доставку через API
        await deliveriesApi.update(delivery.id, {
          dateTime: newDateTimeStr,
        });

        // Обновляем локальное состояние
        updateDeliveryInList(updatedDelivery);
      } catch (err) {
        console.error("Ошибка при перемещении доставки:", err);
        // В случае ошибки отменяем оптимистичное обновление
        setDraggedDelivery(null);
        setIsDragging(false);
        setDragOverCell(null);
        return;
      }

      setDraggedDelivery(null);
      setIsDragging(false);
      setDragOverCell(null);
    },
    [selectedDate, getMonday, canCreateInCell, updateDeliveryInList],
  );

  const {
    showDeliveryDialog,
    setShowDeliveryDialog,
    form,
    error,
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
    setCompletingDelivery,
    // Complete delivery modal
    showCompleteDialog,
    setShowCompleteDialog,
    completeForm,
    handleSaveComplete,
    handleCancelComplete,
    isChangingRecipient,
  } = useAddDelivery({
    initialData: deliveryData || undefined,
    onDeliveryCreated: handleDeliveryCreated,
  });

  // Reset initial data after dialog is shown
  useEffect(() => {
    if (showDeliveryDialog && deliveryData) {
      setDeliveryData(null);
      setDraggedDelivery(null);
    }
  }, [showDeliveryDialog, deliveryData]);

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

  const handleCellClick = (dayIndex: number, hour: number) => {
    const dt = new Date(selectedDate);
    const currentDay = dt.getDay() === 0 ? 6 : dt.getDay() - 1;
    const targetDay = DAYS_WEEK.indexOf(DAYS_WEEK[dayIndex]);
    const diff = targetDay - currentDay;
    dt.setDate(dt.getDate() + diff);
    dt.setHours(hour, 0, 0, 0);
    setDeliveryData({ selectedDate: dt, selectedHour: hour });
  };

  return (
    <div className="flex flex-col gap-4 max-h-[100vh]">
      {/* Верхняя панель с навигацией */}
      <div className="flex-shrink-0">
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            {/* Заголовок с навигацией */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle>Календарь доставок</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCurrent}
                  className="bg-blue-500 rounded-2xl text-white shadow-none hover:bg-blue-600 hover:text-white"
                >
                  Сегодня
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    className="rounded-2xl"
                    variant="outline"
                    size="icon"
                    onClick={handlePrevWeek}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button className="rounded-2xl" variant="outline">
                    {formatWeekRange}
                  </Button>
                  <Button
                    className="rounded-2xl"
                    variant="outline"
                    size="icon"
                    onClick={handleNextWeek}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Загрузка и ошибки */}
      {isLoading && <div className="text-center py-8">Загрузка...</div>}
      {calendarError && <div className="text-center py-8 text-red-500">{calendarError}</div>}

      {/* Календарь с прокруткой */}
      {!isLoading && !calendarError && (
        <div className="flex-1 flex flex-col max-h-[calc(100vh-140px)]">
          <div className="border rounded-2xl shadow-xl overflow-hidden bg-white flex-1 flex flex-col">
            {/* Шапка с днями недели (фиксированная) */}
            <div className="grid grid-cols-[70px_repeat(7,1fr)] border-b bg-zinc-50 flex-shrink-0 sticky top-0 z-10">
              <div className="py-2 text-center text-xs font-medium text-muted-foreground border-r whitespace-nowrap">
                Время
              </div>
              {DAYS_WEEK.map((day, dayIndex) => {
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
                const isWeekend = dayIndex === 5 || dayIndex === 6; // Сб, Вс

                return (
                  <div
                    key={day}
                    className={cn(
                      "p-3 text-center text-sm font-medium border-r",
                      isToday && "bg-blue-50 text-blue-600",
                      !isToday && isWeekend && "bg-red-100",
                    )}
                  >
                    <div>{day}</div>
                    <div className={cn("text-lg", isToday && "font-bold")}>{dayDate.getDate()}</div>
                  </div>
                );
              })}
            </div>

            {/* Часы с доставками (скроллируемая область) */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid grid-cols-[70px_repeat(7,1fr)] border-b hover:bg-zinc-50 transition-colors"
                >
                  {/* Ячейка времени (фиксированная колонка) */}
                  <div className="p-2 text-center text-xs text-muted-foreground border-r bg-zinc-50 whitespace-nowrap sticky left-0 z-20">
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                  {/* Ячейки дней */}
                  {DAYS_WEEK.map((_, dayIndex) => {
                    const dayDeliveries = getDeliveriesForDay(dayIndex);
                    const hourDeliveries = dayDeliveries.filter((d) => {
                      const h = new Date(d.dateTime).getHours();
                      return h === hour;
                    });

                    // Вычисляем дату для этой ячейки
                    const date = new Date(selectedDate);
                    const currentDay = date.getDay() === 0 ? 6 : date.getDay() - 1;
                    const targetDay = DAYS_WEEK.indexOf(DAYS_WEEK[dayIndex]);
                    const diff = targetDay - currentDay;
                    const cellDate = new Date(date);
                    cellDate.setDate(date.getDate() + diff);
                    cellDate.setHours(hour, 0, 0, 0);

                    const now = new Date();
                    const isPast = cellDate <= now;
                    const canDrop = !isPast;
                    const hasDelivery = hourDeliveries.length > 0;

                    const isDragOver =
                      isDragging &&
                      dragOverCell?.dayIndex === dayIndex &&
                      dragOverCell?.hour === hour;

                    return (
                      <div
                        key={dayIndex}
                        className={cn(
                          "p-1 border-r min-h-[60px] relative group",
                          isDragOver && canDrop && "bg-blue-200 transition-colors",
                          !hasDelivery &&
                            !isPast &&
                            !isDragging &&
                            "hover:bg-blue-50 transition-colors cursor-pointer",
                          !hasDelivery &&
                            isPast &&
                            !isDragging &&
                            "hover:bg-zinc-50 transition-colors",
                        )}
                        onClick={() => {
                          if (!hasDelivery && !isPast && !isDragging) {
                            handleCellClick(dayIndex, hour);
                          }
                        }}
                        onDragOver={
                          canDrop
                            ? (e) => {
                                handleDragOver(dayIndex, hour)(e);
                              }
                            : undefined
                        }
                        onDragLeave={() => {
                          if (dragOverCell?.dayIndex === dayIndex && dragOverCell?.hour === hour) {
                            setDragOverCell(null);
                          }
                        }}
                        onDrop={() => {
                          if (canDrop) {
                            handleDrop(dayIndex, hour);
                          }
                        }}
                      >
                        {/* Иконки по центру ячейки (только если нет доставки) */}
                        {!hasDelivery && (
                          <div
                            className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!hasDelivery && !isPast) {
                                handleCellClick(dayIndex, hour);
                              }
                            }}
                          >
                            {isPast ? (
                              <BanIcon className="h-12 w-12 text-gray-400/40" />
                            ) : (
                              <PlusIcon className="h-12 w-12 text-gray-400/40" />
                            )}
                          </div>
                        )}
                        {hourDeliveries.map((delivery) => {
                          const isCompleted = delivery.status === "completed";
                          const isDragDisabled = isCompleted;

                          return (
                            <DeliveryBlock
                              key={delivery.id}
                              delivery={delivery}
                              time={formatTime(delivery.dateTime)}
                              onEdit={handleEditDelivery}
                              onDragStart={handleDragStart}
                              isDragDisabled={isDragDisabled}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления доставки */}
      <AddDeliveryModal
        showDeliveryDialog={showDeliveryDialog}
        setShowDeliveryDialog={setShowDeliveryDialog}
        form={form}
        error={error}
        editingDelivery={editingDelivery}
        handleSaveDelivery={handleSaveDelivery}
        handleCompleteDelivery={handleCompleteDelivery}
        handleChangeRecipient={handleChangeRecipient}
        drivers={drivers}
        cars={cars}
        availableOrders={availableOrders}
        users={users}
        completingDelivery={completingDelivery}
        setCompletingDelivery={setCompletingDelivery}
        handleCancelDelivery={handleCancelDelivery}
        isChangingRecipient={isChangingRecipient}
      />

      {/* Модальное окно завершения доставки */}
      <CompleteDeliveryModal
        showCompleteDialog={showCompleteDialog}
        setShowCompleteDialog={setShowCompleteDialog}
        form={completeForm}
        control={completeForm.control}
        editingDelivery={editingDelivery}
        handleSaveComplete={handleSaveComplete}
        handleCancelComplete={handleCancelComplete}
        drivers={drivers}
        users={users}
        isChangingRecipient={isChangingRecipient}
      />

      <div
        className={`fixed transition-all ${isMobile ? (hideBottomTabbar ? "-bottom-[58px]" : "bottom-2") : hideBottomTabbar ? "-bottom-[58px]" : "bottom-4"} left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-zinc-600/30 backdrop-blur-md shadow-xl border-zinc-200 rounded-2xl`}
      >
        <div
          onClick={() => setHideBottomTabbar(false)}
          className={`absolute -top-4 left-1/2 -translate-x-1/2 px-1 pb-2 bg-[rgb(194,194,197)] rounded-2xl hover:bg-[rgb(173,173,176)] flex items-center justify-center cursor-pointer z-10 transition-all ${hideBottomTabbar ? "opacity-100" : "opacity-0"}`}
        >
          <ChevronUp className="text-white w-5" />
        </div>

        <Link to="/">
          <Button type="button" className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600">
            <HomeIcon className="w-4 h-4" />
          </Button>
        </Link>

        <Button
          onClick={() => setHideBottomTabbar(true)}
          type="button"
          className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
