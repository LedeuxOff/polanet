import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/contexts/auth-context";
import { cn } from "@/lib/utils";
import { CakeIcon, ClockIcon, MoonIcon, SunIcon, SunriseIcon, SunsetIcon } from "lucide-react";
import { homeCardClass } from "./ui-parts";

const getGreeting = (hour: number) => {
  if (hour >= 5 && hour < 12) return { text: "Доброе утро", Icon: SunriseIcon };
  if (hour >= 12 && hour < 17) return { text: "Добрый день", Icon: SunIcon };
  if (hour >= 17 && hour < 23) return { text: "Добрый вечер", Icon: SunsetIcon };
  return { text: "Доброй ночи", Icon: MoonIcon };
};

const isBirthdayToday = (birthDate: string | null | undefined, now: Date) => {
  if (!birthDate) return false;
  const [, month, day] = birthDate.slice(0, 10).split("-").map(Number);
  return month === now.getMonth() + 1 && day === now.getDate();
};

const getIsoWeek = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
};

const useNow = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
};

export const WelcomeSection = () => {
  const { user } = useAuth();
  const now = useNow();
  const { text, Icon } = getGreeting(now.getHours());
  const birthday = isBirthdayToday(user?.birthDate, now);
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "?";

  const month = now.toLocaleDateString("ru-RU", { month: "long" });
  const weekday = now.toLocaleDateString("ru-RU", { weekday: "long" });
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const dayProgress = Math.round(((now.getHours() * 60 + now.getMinutes()) / 1440) * 100);
  const week = getIsoWeek(now);

  return (
    <Card className={cn(homeCardClass, "col-span-12")}>
      {/* Декоративный фон */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-violet-500/10 dark:via-transparent dark:to-cyan-500/10" />
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-500/20" />
      <div className="pointer-events-none absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-cyan-200/40 blur-3xl dark:bg-cyan-500/15" />

      <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 text-lg font-semibold text-white shadow-md">
            {initials}
          </div>
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-300">
              <Icon className="h-4 w-4 text-amber-500 dark:text-amber-300" />
              {text}
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {user?.firstName || "Гость"}
              {user?.middleName ? ` ${user.middleName}` : ""}
            </h2>
            {user?.roleName && (
              <span className="w-fit rounded-full border border-violet-200 bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:border-violet-400/30 dark:bg-violet-400/15 dark:text-violet-200">
                {user.roleName}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {/* Отрывной календарь */}
          <div className="flex w-24 flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm dark:border-white/15 dark:bg-white/5">
            <div className="relative bg-red-500 py-1 text-center text-xs font-semibold uppercase tracking-wider text-white">
              {month.slice(0, 3)}
              <span className="absolute left-4 top-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/80" />
              <span className="absolute right-4 top-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/80" />
            </div>
            <div className="flex flex-1 flex-col items-center justify-center py-1.5">
              <span className="text-3xl font-bold leading-none tabular-nums text-slate-900 dark:text-slate-100">
                {now.getDate()}
              </span>
              <span className="mt-1 text-[11px] font-medium text-slate-500 first-letter:uppercase dark:text-slate-300">
                {weekday}
              </span>
            </div>
            <div className="border-t border-dashed border-slate-200 py-0.5 text-center text-[10px] text-slate-400 dark:border-white/15">
              неделя {week}
            </div>
          </div>

          {/* Часы */}
          <div className="flex w-36 flex-col justify-between rounded-[20px] bg-slate-900 p-3 text-white shadow-sm dark:bg-black/40 dark:ring-1 dark:ring-white/15">
            <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
              <ClockIcon className="h-3.5 w-3.5" />
              Сейчас
            </span>
            <span className="font-mono text-4xl font-bold leading-none tabular-nums">
              {hours}
              <span className="animate-[pulse_1s_steps(2,start)_infinite] text-cyan-400">:</span>
              {minutes}
            </span>
            <div className="flex flex-col gap-1">
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-cyan-400 transition-[width] duration-1000"
                  style={{ width: `${dayProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400">День прошёл на {dayProgress}%</span>
            </div>
          </div>
        </div>
      </div>

      {birthday && (
        <div className="relative mx-6 mb-6 flex items-center gap-2 rounded-2xl border border-pink-200 bg-pink-50 px-3 py-2 text-sm font-medium text-pink-700 dark:border-pink-400/30 dark:bg-pink-400/10 dark:text-pink-200">
          <CakeIcon className="h-4 w-4" />С днём рождения! Отличного дня 🎉
        </div>
      )}
    </Card>
  );
};
