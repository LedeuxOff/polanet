import { useCallback, useEffect, useMemo, useState } from "react";
import { teamsApi, worksApi } from "@/lib/api";
import type { Team, Work } from "@/lib/types";
import {
  HOURS,
  NO_TEAM,
  addDays,
  getMonday,
  getWorkRange,
  toDateKey,
  workCoversHour,
} from "./consts";

/** Выбранный интервал в календаре: день + начало и окончание (HH:MM) */
export type Slot = { date: string; startTime: string; endTime: string; teamId?: number | null };

/** Фильтр по бригаде: "all" | NO_TEAM | id бригады */
export type TeamFilter = string;

export const cellKey = (date: string, hour: number) => `${date}|${hour}`;

const byTime = (a: Work, b: Work) => {
  const ra = getWorkRange(a);
  const rb = getWorkRange(b);
  return ra.start - rb.start || ra.end - rb.end || a.id - b.id;
};

export function useWorksCalendar(selectedDate: Date, teamFilter: TeamFilter) {
  const [works, setWorks] = useState<Work[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => {
    const monday = getMonday(selectedDate);
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [selectedDate]);

  const startDate = toDateKey(days[0]);
  const endDate = toDateKey(days[6]);

  const loadTeams = useCallback(async () => {
    try {
      setTeams(await teamsApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить бригады");
    }
  }, []);

  const loadWorks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setWorks(await worksApi.calendar(startDate, endDate));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить работы");
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  useEffect(() => {
    loadWorks();
  }, [loadWorks]);

  const visibleWorks = useMemo(() => {
    if (teamFilter === "all") return works;
    if (teamFilter === NO_TEAM) return works.filter((w) => w.teamId === null);
    return works.filter((w) => String(w.teamId) === teamFilter);
  }, [works, teamFilter]);

  // Работы дня по времени начала
  const worksByDay = useMemo(() => {
    const map = new Map<string, Work[]>();
    for (const work of visibleWorks) {
      const list = map.get(work.date);
      if (list) list.push(work);
      else map.set(work.date, [work]);
    }
    for (const list of map.values()) list.sort(byTime);
    return map;
  }, [visibleWorks]);

  // Ячейки «день × час»: работа дублируется в каждом часе, который она занимает
  const worksByCell = useMemo(() => {
    const map = new Map<string, Work[]>();
    for (const [date, list] of worksByDay) {
      for (const hour of HOURS) {
        const inHour = list.filter((w) => workCoversHour(w, hour));
        if (inHour.length) map.set(cellKey(date, hour), inHour);
      }
    }
    return map;
  }, [worksByDay]);

  const getDayWorks = useCallback((date: string) => worksByDay.get(date) ?? [], [worksByDay]);
  const getCellWorks = useCallback(
    (date: string, hour: number) => worksByCell.get(cellKey(date, hour)) ?? [],
    [worksByCell],
  );

  // Локальное обновление после create/update/delete — без перезагрузки недели
  const upsertWork = useCallback(
    (work: Work) => {
      setWorks((prev) => {
        const inWeek = work.date >= startDate && work.date <= endDate;
        const exists = prev.some((w) => w.id === work.id);
        if (!inWeek) return prev.filter((w) => w.id !== work.id);
        return exists ? prev.map((w) => (w.id === work.id ? work : w)) : [...prev, work];
      });
    },
    [startDate, endDate],
  );

  const removeWork = useCallback((id: number) => {
    setWorks((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return {
    days,
    startDate,
    endDate,
    works,
    visibleWorks,
    teams,
    isLoading,
    error,
    getDayWorks,
    getCellWorks,
    upsertWork,
    removeWork,
    reloadWorks: loadWorks,
    reloadTeams: loadTeams,
  };
}
