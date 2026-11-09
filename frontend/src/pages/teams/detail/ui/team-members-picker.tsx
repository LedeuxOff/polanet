import { useEffect, useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <CardTitle>
          Участники <span className="text-muted-foreground">({value.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9 rounded-xl"
            placeholder="Поиск рабочего по ФИО или телефону"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Загрузка рабочих...</div>
        ) : workers.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Рабочих пока нет — добавьте их в разделе «Рабочие»
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto rounded-xl border divide-y dark:border-white/20 dark:divide-white/10">
            {visible.map((w) => {
              const inOtherTeam = w.teamId !== null && w.teamId !== teamId;
              return (
                <label
                  key={w.id}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-white/5"
                >
                  <Checkbox
                    checked={selected.has(w.id)}
                    disabled={disabled}
                    onCheckedChange={(v) => toggle(w.id, v === true)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{getWorkerName(w)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPhoneDisplay(w.phone) || "без телефона"}
                      {inOtherTeam && ` · сейчас в бригаде «${w.teamName}» — перейдёт сюда`}
                    </div>
                  </div>
                </label>
              );
            })}
            {visible.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">Никого не найдено</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
