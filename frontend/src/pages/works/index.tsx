import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomBar } from "@/components/bottom-bar";
import { useIsMobile } from "@/hooks";
import { worksApi } from "@/lib/api";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import type { Work } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  NO_TEAM,
  getStatusClasses,
  addDays,
  formatDayMonth,
  moveRange,
  fromDateKey,
  isValidDateKey,
  toDateKey,
} from "./consts";
import { useWorksCalendar, type Slot, type TeamFilter } from "./hooks";
import { useWorkDirectories } from "./use-directories";
import { WorksWeekGrid } from "./ui/works-week-grid";
import { WorksDayList } from "./ui/works-day-list";
import { WorkCreateModal } from "./ui/work-create-modal";
import { SlotModal } from "./ui/slot-modal";

export const WorksPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const search = useSearch({ from: "/works" });
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    search.date && isValidDateKey(search.date) ? fromDateKey(search.date) : new Date(),
  );
  // Текст поля даты отдельно от выбранной даты: пока год вводится по цифрам,
  // браузер присылает промежуточные значения (0002, 0020, 0202...) — их не применяем
  const [dateInput, setDateInput] = useState(() => toDateKey(selectedDate));
  useEffect(() => setDateInput(toDateKey(selectedDate)), [selectedDate]);
  const [openWork, setOpenWork] = useState<Work | null>(null);
  const [createSlot, setCreateSlot] = useState<Slot | null>(null);
  const [teamFilter, setTeamFilter] = useState<TeamFilter>("all");
  const { statuses } = useWorkDirectories();

  const calendar = useWorksCalendar(selectedDate, teamFilter);
  const { days, teams, isLoading, error, getDayWorks, getCellWorks, upsertWork, removeWork } = calendar;

  const canCreate = hasPermission("works:create");
  const canUpdate = hasPermission("works:update");

  // Неделя — в адресе, чтобы ссылку можно было отправить
  const weekKey = toDateKey(days[0]);
  useEffect(() => {
    navigate({
      to: "/works",
      search: (prev) => ({ ...prev, date: weekKey }),
      replace: true,
    });
  }, [weekKey, navigate]);

  // ?workId= — открыть работу (например, со страницы клиента)
  useEffect(() => {
    if (!search.workId) return;
    worksApi
      .get(search.workId)
      .then((work) => {
        setSelectedDate(fromDateKey(work.date));
        setOpenWork(work);
      })
      .catch(() => showToast("Работа не найдена", "error"))
      .finally(() =>
        navigate({
          to: "/works",
          search: (prev) => ({ ...prev, workId: undefined }),
          replace: true,
        }),
      );
  }, [search.workId, navigate, showToast]);

  const openCreate = (slot: Slot) => {
    if (!canCreate) {
      showToast("У вас нет прав на создание работы", "error");
      return;
    }
    // Если включён фильтр по бригаде — новая работа сразу для неё
    const teamId =
      teamFilter === "all" || teamFilter === NO_TEAM ? null : Number(teamFilter);
    setCreateSlot({ ...slot, teamId });
  };

  // Перетаскивание карточки в другую ячейку: меняются день и время, бригада остаётся
  const handleMove = async (workId: number, date: string, newStart: string) => {
    const work = calendar.works.find((w) => w.id === workId);
    if (!work) return;
    const { startTime, endTime } = moveRange(work, newStart);
    if (work.date === date && work.startTime === startTime && work.endTime === endTime) return;
    upsertWork({ ...work, date, startTime, endTime }); // оптимистично
    try {
      upsertWork(await worksApi.update(workId, { date, startTime, endTime }));
    } catch (err) {
      upsertWork(work);
      showToast(err instanceof Error ? err.message : "Не удалось перенести работу", "error");
    }
  };

  const weekLabel = `${formatDayMonth(days[0])} – ${formatDayMonth(days[6])}`;
  const weekCount = calendar.visibleWorks.length;

  return (
    <div className="flex flex-col gap-4 pb-28">
      <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between space-y-0">
          <CardTitle>Календарь работ</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate((d) => addDays(d, -7))}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div className="min-w-[120px] text-center font-medium">{weekLabel}</div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate((d) => addDays(d, 7))}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" onClick={() => setSelectedDate(new Date())}>
              Сегодня
            </Button>
            <input
              type="date"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={dateInput}
              onChange={(e) => {
                const value = e.target.value;
                setDateInput(value);
                if (isValidDateKey(value)) setSelectedDate(fromDateKey(value));
              }}
              onBlur={() => setDateInput(toDateKey(selectedDate))}
            />
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все бригады</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
                <SelectItem value={NO_TEAM}>Без бригады</SelectItem>
              </SelectContent>
            </Select>
            {hasPermission("teams:list") && (
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/teams" })}>
                <UsersIcon className="mr-2 h-4 w-4" /> Бригады
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {statuses
          .filter((s) => s.showInCalendar)
          .map((s) => (
          <span key={s.code} className={cn("rounded-full border px-2 py-0.5", getStatusClasses(s.color))}>
            {s.name}
          </span>
        ))}
        <span className="ml-auto text-muted-foreground dark:text-slate-300">
          {isLoading ? "Загрузка..." : `Работ за неделю: ${weekCount}`}
        </span>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {isMobile ? (
        <WorksDayList
          days={days}
          getDayWorks={getDayWorks}
          canCreate={canCreate}
          onCreate={openCreate}
          onOpen={setOpenWork}
        />
      ) : (
        <WorksWeekGrid
          days={days}
          getCellWorks={getCellWorks}
          canCreate={canCreate}
          canMove={canUpdate}
          onCreate={openCreate}
          onOpen={setOpenWork}
          onMove={handleMove}
        />
      )}

      <SlotModal
        work={openWork}
        teams={teams}
        onClose={() => setOpenWork(null)}
        onSaved={upsertWork}
        onDeleted={removeWork}
      />

      <WorkCreateModal
        slot={createSlot}
        teams={teams}
        onClose={() => setCreateSlot(null)}
        onCreated={(work) => {
          upsertWork(work);
          setCreateSlot(null);
        }}
      />

      <BottomBar
        onCreate={() => openCreate({ date: toDateKey(new Date()), startTime: "09:00", endTime: "10:00" })}
        hideSaveButton={!canCreate}
      />
    </div>
  );
};
