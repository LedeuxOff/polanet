import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { deliveriesApi, DeliveriesSummary } from "@/lib/api/deliveries-api";
import { usePermissions } from "@/lib/contexts/permission-context";
import { cardTints, homeCardClass, SectionContent, SectionHeader, StatTile } from "./ui-parts";
import {
  CalendarCheckIcon,
  CalendarClockIcon,
  CalendarDaysIcon,
  CalendarRangeIcon,
  CheckCircle2Icon,
  LoaderIcon,
} from "lucide-react";

const pad = (n: number) => String(n).padStart(2, "0");
const toLocalDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toLocalDateTime = (d: Date) =>
  `${toLocalDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

// Границы текущей недели (пн–вс) в локальном времени
const getPeriodParams = () => {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    now: toLocalDateTime(now),
    today: toLocalDate(now),
    weekStart: toLocalDate(monday),
    weekEnd: toLocalDate(sunday),
  };
};

const formatNearest = (dateTime: string) => {
  const date = new Date(dateTime);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const time = date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  if (toLocalDate(date) === toLocalDate(today)) return `Сегодня, ${time}`;
  if (toLocalDate(date) === toLocalDate(tomorrow)) return `Завтра, ${time}`;
  return `${date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}, ${time}`;
};

export const DeliveriesCalendarSection = () => {
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const canViewStats = hasPermission("deliveries:list");
  const [summary, setSummary] = useState<DeliveriesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isPermissionsLoading || !canViewStats) return;
    deliveriesApi
      .summary(getPeriodParams())
      .then(setSummary)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [isPermissionsLoading, canViewStats]);

  if (isPermissionsLoading || !canViewStats) return null;

  const show = (value: number | undefined) => (isLoading ? "…" : (value ?? 0));

  return (
    <Link to="/calendar" className="col-span-12">
      <Card className={cn(homeCardClass, cardTints.cyan)}>
        <SectionHeader
          title="Календарь доставок"
          description="Просмотр, создание и редактирование предстоящих доставок"
          color="cyan"
          icon={<CalendarDaysIcon />}
        />

        <SectionContent color="cyan">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatTile
              icon={<CalendarClockIcon className="h-3.5 w-3.5" />}
              label="Ближайшая доставка"
              className="col-span-2 lg:col-span-1"
              valueClassName="text-lg leading-8 text-cyan-600 dark:text-cyan-300"
              value={
                isLoading ? "…" : summary?.nearest ? formatNearest(summary.nearest.dateTime) : "Нет"
              }
              hint={
                summary?.nearest
                  ? `Заявка № ${summary.nearest.orderId} · доставка № ${summary.nearest.id}`
                  : undefined
              }
            />
            <StatTile
              icon={<CalendarCheckIcon className="h-3.5 w-3.5" />}
              label="Сегодня"
              value={show(summary?.today)}
            />
            <StatTile
              icon={<CalendarRangeIcon className="h-3.5 w-3.5" />}
              label="На этой неделе"
              value={show(summary?.week)}
            />
            <StatTile
              icon={<CheckCircle2Icon className="h-3.5 w-3.5" />}
              label="Завершено всего"
              value={show(summary?.completed)}
              valueClassName="text-green-600 dark:text-green-300"
            />
            <StatTile
              icon={<LoaderIcon className="h-3.5 w-3.5" />}
              label="Не завершено"
              value={show(summary?.inProgress)}
              valueClassName="text-blue-600 dark:text-blue-300"
            />
          </div>
        </SectionContent>
      </Card>
    </Link>
  );
};
