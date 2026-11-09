import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Work } from "@/lib/types";
import {
  DAYS_SHORT,
  formatDayMonth,
  formatWorkTime,
  getClientName,
  getStatusClasses,
  toDateKey,
} from "../consts";
import type { Slot } from "../hooks";

interface Props {
  days: Date[];
  getDayWorks: (date: string) => Work[];
  canCreate: boolean;
  onCreate: (slot: Slot) => void;
  onOpen: (work: Work) => void;
}

/** Мобильная версия: дни списком, работы дня — по времени начала */
export const WorksDayList = ({ days, getDayWorks, canCreate, onCreate, onOpen }: Props) => {
  const todayKey = toDateKey(new Date());

  return (
    <div className="flex flex-col gap-3">
      {days.map((day, i) => {
        const date = toDateKey(day);
        const works = getDayWorks(date);
        return (
          <div
            key={date}
            className={cn(
              "rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border-white/20",
              date === todayKey && "ring-2 ring-blue-400",
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold dark:text-slate-100">
                {DAYS_SHORT[i]}, {formatDayMonth(day)}
              </span>
              {canCreate && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  onClick={() => onCreate({ date, startTime: "09:00", endTime: "10:00" })}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
            {works.length === 0 ? (
              <div className="text-xs text-muted-foreground">Работ нет</div>
            ) : (
              <div className="flex flex-col gap-1">
                {works.map((work) => (
                  <button
                    key={work.id}
                    type="button"
                    onClick={() => onOpen(work)}
                    className={cn(
                      "w-full rounded-lg border px-2 py-1.5 text-left text-xs",
                      getStatusClasses(work.statusInfo.color),
                    )}
                  >
                    <div className="flex gap-2">
                      <span className="font-bold whitespace-nowrap">{formatWorkTime(work)}</span>
                      <span className="font-semibold truncate">{getClientName(work.client)}</span>
                    </div>
                    {work.address && <div className="truncate opacity-80">{work.address}</div>}
                    {work.team && <div className="opacity-80">Бригада: {work.team.name}</div>}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
