import { useEffect, useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { workersApi } from "@/lib/api";
import { Worker, getWorkerName } from "@/lib/types";
import { formatPhoneDisplay } from "@/lib/utils/phone";

interface Props {
  /** id текущей бригады (для новой — null) */
  teamId: number | null;
  value: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}

/** Состав бригады: выбор участников из рабочих (роль WORKER) */
export const TeamMembersPicker = ({ teamId, value, onChange, disabled }: Props) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    workersApi
      .list({ limit: 500 })
      .then((res) => setWorkers(res.data))
      .catch(() => setWorkers([]))
      .finally(() => setIsLoading(false));
  }, []);

  const selected = useMemo(() => new Set(value), [value]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const digits = term.replace(/\D/g, "");
    const list = term
      ? workers.filter(
          (w) =>
            getWorkerName(w).toLowerCase().includes(term) ||
            (digits.length >= 3 && (w.phone ?? "").includes(digits)),
        )
      : workers;
    // Сначала участники бригады, потом свободные, потом из других бригад
    const rank = (w: Worker) => (selected.has(w.id) ? 0 : w.teamId ? 2 : 1);
    return [...list].sort((a, b) => rank(a) - rank(b));
  }, [workers, search, selected]);

  const toggle = (id: number, checked: boolean) =>
    onChange(checked ? [...value, id] : value.filter((v) => v !== id));

  return (
    <div key="members" className="col-span-full flex flex-col gap-3">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="h-11 rounded-2xl pl-9 dark:border-white/20 dark:bg-white/10"
          placeholder="Поиск рабочего по ФИО или телефону"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className="h-14 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/10"
            />
          ))}
        </div>
      ) : workers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-white/20 dark:text-slate-400">
          Рабочих пока нет — добавьте их в разделе «Рабочие»
        </div>
      ) : (
        <div className="grid max-h-[480px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {visible.map((w) => {
            const isSelected = selected.has(w.id);
            const inOtherTeam = w.teamId !== null && w.teamId !== teamId;
            const name = getWorkerName(w);
            const initials = name
              .split(" ")
              .slice(0, 2)
              .map((p) => p[0])
              .join("")
              .toUpperCase();
            return (
              <button
                key={w.id}
                type="button"
                disabled={disabled}
                onClick={() => toggle(w.id, !isSelected)}
                aria-pressed={isSelected}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60",
                  isSelected
                    ? "border-sky-300 bg-sky-50 dark:border-sky-400/40 dark:bg-sky-400/10"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/15 dark:bg-white/5 dark:hover:border-white/25",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-semibold",
                    isSelected
                      ? "bg-sky-600 text-white dark:bg-sky-500"
                      : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200",
                  )}
                >
                  {isSelected ? <CheckIcon className="h-5 w-5" /> : initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {name}
                  </div>
                  <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {formatPhoneDisplay(w.phone) || "без телефона"}
                  </div>
                  {inOtherTeam && (
                    <div
                      className={cn(
                        "mt-1 w-fit rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                        isSelected
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200"
                          : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400",
                      )}
                    >
                      {isSelected ? `Перейдёт из «${w.teamName}»` : `В бригаде «${w.teamName}»`}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
          {visible.length === 0 && (
            <div className="col-span-full px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Никого не найдено
            </div>
          )}
        </div>
      )}
    </div>
  );
};
