import { useEffect, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { teamsApi } from "@/lib/api";
import { useToast } from "@/lib/contexts/toast-context";
import type { Team } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Вызывается после любого изменения, чтобы календарь перечитал бригады */
  onChanged: () => void;
}

/** Управление бригадами — строками календаря работ */
export const TeamsDialog = ({ open, onOpenChange, onChanged }: Props) => {
  const { showToast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [names, setNames] = useState<Record<number, string>>({});
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const list = await teamsApi.list(true);
    setTeams(list);
    setNames(Object.fromEntries(list.map((t) => [t.id, t.name])));
  };

  useEffect(() => {
    if (open) load().catch(() => showToast("Не удалось загрузить бригады", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const run = async (action: () => Promise<unknown>, success?: string) => {
    setBusy(true);
    try {
      await action();
      await load();
      onChanged();
      if (success) showToast(success, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Ошибка", "error");
    } finally {
      setBusy(false);
    }
  };

  const move = (index: number, dir: -1 | 1) => {
    const other = teams[index + dir];
    const team = teams[index];
    if (!other) return;
    run(async () => {
      // Перенумеровываем все, чтобы порядок был однозначным
      const reordered = [...teams];
      reordered[index] = other;
      reordered[index + dir] = team;
      await Promise.all(reordered.map((t, i) => teamsApi.update(t.id, { sortOrder: i })));
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Бригады</DialogTitle>
          <DialogDescription>
            Каждая активная бригада — строка в календаре. Неактивные скрыты, их работы видны в
            строке «Без бригады».
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {teams.map((team, i) => {
            const changed = (names[team.id] ?? "").trim() !== team.name;
            return (
              <div key={team.id} className="flex items-center gap-2">
                <Checkbox
                  checked={team.isActive}
                  disabled={busy}
                  title="Активна"
                  onCheckedChange={(v) => run(() => teamsApi.update(team.id, { isActive: v === true }))}
                />
                <Input
                  value={names[team.id] ?? ""}
                  disabled={busy}
                  onChange={(e) => setNames((n) => ({ ...n, [team.id]: e.target.value }))}
                />
                {changed && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={busy || !(names[team.id] ?? "").trim()}
                    onClick={() =>
                      run(() => teamsApi.update(team.id, { name: names[team.id].trim() }), "Сохранено")
                    }
                  >
                    OK
                  </Button>
                )}
                <Button type="button" size="icon" variant="ghost" disabled={busy || i === 0} onClick={() => move(i, -1)}>
                  <ArrowUpIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={busy || i === teams.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDownIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={busy}
                  title="Удалить (работы перейдут в «Без бригады»)"
                  onClick={() => run(() => teamsApi.delete(team.id), "Бригада удалена")}
                >
                  <Trash2Icon className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            );
          })}
          {teams.length === 0 && (
            <div className="text-sm text-muted-foreground">Бригад пока нет</div>
          )}
        </div>

        <form
          className="flex gap-2 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            const name = newName.trim();
            if (!name) return;
            run(async () => {
              await teamsApi.create({ name, sortOrder: teams.length });
              setNewName("");
            }, "Бригада добавлена");
          }}
        >
          <Input
            placeholder="Название новой бригады"
            value={newName}
            disabled={busy}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button type="submit" disabled={busy || !newName.trim()}>
            <PlusIcon className="mr-2 h-4 w-4" /> Добавить
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
