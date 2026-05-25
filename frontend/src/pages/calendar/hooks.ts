import { useState, useCallback, useMemo, useEffect } from "react";
import { calendarApi } from "@/lib/api/calendar-api";
import type { CalendarDelivery } from "@/lib/types";

// Дни недели на русском
export const DAYS_WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
export const DAYS_WEEK_FULL = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

// Часы для отображения
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function useCalendar(selectedDate: Date) {
  const [deliveries, setDeliveries] = useState<CalendarDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Вычисляем неделю на основе selectedDate
  const weekRange = useMemo(() => {
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    // Корректируем для понедельника как первого дня
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return {
      start: monday,
      end: sunday,
      startDate: monday.toISOString().split("T")[0],
      endDate: sunday.toISOString().split("T")[0],
    };
  }, [selectedDate]);

  // Форматируем дату для отображения
  const formatWeekRange = useMemo(() => {
    const startDay = weekRange.start.getDate();
    const startMonth = weekRange.start.getMonth() + 1;
    const endDay = weekRange.end.getDate();
    const endMonth = weekRange.end.getMonth() + 1;

    const formatD = (d: number) => d.toString().padStart(2, "0");
    const formatM = (m: number) => m.toString().padStart(2, "0");

    return `${formatD(startDay)}.${formatM(startMonth)} – ${formatD(endDay)}.${formatM(endMonth)}`;
  }, [weekRange]);

  // Форматируем время
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Загружаем доставки
  const loadDeliveries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await calendarApi.getDeliveries(weekRange.startDate, weekRange.endDate);
      setDeliveries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  }, [weekRange.startDate, weekRange.endDate]);

  // Переключение на предыдущую неделю
  const prevWeek = useCallback((date: Date) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 7);
    return newDate;
  }, []);

  // Переключение на следующую неделю
  const nextWeek = useCallback((date: Date) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 7);
    return newDate;
  }, []);

  // Переход к текущей неделе
  const currentWeek = useCallback(() => {
    return new Date();
  }, []);

  return {
    deliveries,
    isLoading,
    error,
    weekRange,
    formatWeekRange,
    formatTime,
    loadDeliveries,
    prevWeek,
    nextWeek,
    currentWeek,
  };
}
