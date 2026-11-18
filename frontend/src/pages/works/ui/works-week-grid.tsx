import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Work } from "@/lib/types";
import { DAYS_SHORT, HOURS, formatHour, minutesToTime, toDateKey } from "../consts";
import { cellKey, type Slot } from "../hooks";
import { WORK_DRAG_TYPE, WorkBlock, decodeDrag } from "./work-block";

interface Props {
  days: Date[];
  getCellWorks: (date: string, hour: number) => Work[];
  canCreate: boolean;
  canMove: boolean;
  onCreate: (slot: Slot) => void;
  onOpen: (work: Work) => void;
  /** Перенос работы: новый день и новое начало (длительность сохраняет родитель через moveRange) */
  onMove: (workId: number, date: string, startTime: string) => void;
}

/**
 * Календарь как в «Календаре доставок»: колонки — дни недели, строки — часы 08:00–23:00.
 * Работа, занимающая несколько часов, дублируется в каждой своей часовой ячейке.
 */
export const WorksWeekGrid = ({
  days,
  getCellWorks,
  canCreate,
  canMove,
  onCreate,
  onOpen,
  onMove,
}: Props) => {
  const [dragOver, setDragOver] = useState<string | null>(null);
  const todayKey = toDateKey(new Date());

  return (
    <div className="flex flex-col max-h-[calc(100vh-200px)]">
      <div className="border rounded-2xl shadow-xl overflow-hidden bg-white flex-1 flex flex-col dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
        {/* Шапка с днями недели */}
        <div className="grid grid-cols-[70px_repeat(7,minmax(0,1fr))] border-b bg-zinc-50 flex-shrink-0 dark:bg-white/10 dark:backdrop-blur-xl dark:border-white/20">
          <div className="py-2 text-center text-xs font-medium text-muted-foreground border-r whitespace-nowrap dark:text-zinc-100 dark:border-white/20">
            Время
          </div>
          {days.map((day, i) => {
            const key = toDateKey(day);
            const isToday = key === todayKey;
            return (
              <div
                key={key}
                className={cn(
                  "p-3 text-center text-sm font-medium border-r last:border-r-0 dark:border-white/20",
                  isToday && "bg-blue-50 text-blue-600 dark:bg-blue-600/40 dark:text-zinc-100",
                  !isToday && i >= 5 && "bg-red-100 dark:bg-red-600/60",
                )}
              >
                <div>{DAYS_SHORT[i]}</div>
                <div className={cn("text-lg", isToday && "font-bold")}>{day.getDate()}</div>
              </div>
            );
          })}
        </div>

        {/* Часовые строки */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[70px_repeat(7,minmax(0,1fr))] border-b last:border-b-0 hover:bg-zinc-50 transition-colors dark:border-white/30 dark:hover:bg-white/10"
            >
              <div className="p-2 text-center text-xs text-muted-foreground border-r bg-zinc-50 whitespace-nowrap dark:text-zinc-100 dark:bg-white/10 dark:border-white/20">
                {formatHour(hour)}
              </div>

              {days.map((day) => {
                const date = toDateKey(day);
                const key = cellKey(date, hour);
                const cellWorks = getCellWorks(date, hour);
                const hasWorks = cellWorks.length > 0;

                return (
                  <div
                    key={key}
                    onClick={() =>
                      canCreate &&
                      onCreate({
                        date,
                        startTime: minutesToTime(hour * 60),
                        endTime: minutesToTime((hour + 1) * 60),
                      })
                    }
                    onDragOver={(e) => {
                      if (!canMove || !e.dataTransfer.types.includes(WORK_DRAG_TYPE)) return;
                      e.preventDefault();
                      setDragOver(key);
                    }}
                    onDragLeave={() => setDragOver((k) => (k === key ? null : k))}
                    onDrop={(e) => {
                      setDragOver(null);
                      const { id, offsetMinutes } = decodeDrag(
                        e.dataTransfer.getData(WORK_DRAG_TYPE),
                      );
                      if (!id) return;
                      // Час, за который взяли карточку, встаёт в эту ячейку
                      onMove(id, date, minutesToTime(Math.max(0, hour * 60 - offsetMinutes)));
                    }}
                    className={cn(
                      "p-1 border-r last:border-r-0 min-h-[60px] relative group flex flex-col gap-1 dark:border-white/20",
                      canCreate && "cursor-pointer hover:bg-blue-50 dark:hover:bg-white/10",
                      dragOver === key && "bg-blue-200 dark:bg-blue-500/30",
                    )}
                  >
                    {!hasWorks && canCreate && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <PlusIcon className="h-6 w-6 text-gray-400/50 dark:text-white/30" />
                      </div>
                    )}
                    {cellWorks.map((work) => (
                      <WorkBlock
                        key={work.id}
                        work={work}
                        hour={hour}
                        draggable={canMove}
                        onClick={() => onOpen(work)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
