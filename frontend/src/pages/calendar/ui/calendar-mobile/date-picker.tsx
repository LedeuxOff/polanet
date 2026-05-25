import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Компонент календаря для выбора даты (в Drawer)
interface DatePickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

export const DatePicker = ({ selectedDate, onSelectDate, onClose }: DatePickerProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [selected, setSelected] = useState(selectedDate);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Получаем первый день месяца
  const firstDay = new Date(year, month, 1);
  // Получаем последний день месяца
  const lastDay = new Date(year, month + 1, 0);
  // День недели первого дня (0=Вс, 1=Пн, ..., 6=Сб)
  let startDay = firstDay.getDay();
  // Корректируем: Пн=0, ..., Вс=6
  startDay = startDay === 0 ? 6 : startDay - 1;

  // Генерируем дни для календаря
  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  // Дни предыдущего месяца
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month, -i),
      isCurrentMonth: false,
    });
  }

  // Дни текущего месяца
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({
      date: new Date(year, month, d),
      isCurrentMonth: true,
    });
  }

  // Дни следующего месяца
  const remaining = 42 - days.length; // 6 недель * 7 дней
  for (let d = 1; d <= remaining; d++) {
    days.push({
      date: new Date(year, month + 1, d),
      isCurrentMonth: false,
    });
  }

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(year, month + offset, 1));
  };

  const handleSelect = (date: Date) => {
    setSelected(date);
    onSelectDate(date);
    onClose();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    );
  };

  const monthName = currentMonth.toLocaleString("ru-RU", { month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => changeMonth(-1)}>
          ←
        </Button>
        <span className="capitalize text-sm font-medium">{monthName}</span>
        <Button variant="outline" size="sm" onClick={() => changeMonth(1)}>
          →
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const today = isToday(day.date);
          const selected = isSelected(day.date);
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 text-sm",
                !day.isCurrentMonth && "text-muted-foreground opacity-50",
                today && "bg-accent font-medium",
                selected &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              )}
              onClick={() => handleSelect(day.date)}
            >
              {day.date.getDate()}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
