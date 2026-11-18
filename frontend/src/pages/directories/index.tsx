import { useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomBar } from "@/components/bottom-bar";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { directoriesApi } from "@/lib/api";
import { useToast } from "@/lib/contexts/toast-context";
import type { StatusColor, WorkStatusRef, WorkTypeRef } from "@/lib/types";
import { cn } from "@/lib/utils";
import { STATUS_COLOR_CLASSES, STATUS_COLOR_NAMES, getStatusClasses } from "@/pages/works/consts";
import { useWorkDirectories } from "@/pages/works/use-directories";

const COLORS = Object.keys(STATUS_COLOR_CLASSES) as StatusColor[];

/** Обёртка для запросов: тост об ошибке + перечитать справочники */
const useRunner = (reload: () => Promise<unknown>) => {
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<unknown>, success?: string) => {
    setBusy(true);
    try {
      await action();
      await reload();
      if (success) showToast(success, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Ошибка", "error");
    } finally {
      setBusy(false);
    }
  };
  return { busy, run };
};

const NameInput = ({
  value,
  disabled,
  onSave,
}: {
  value: string;
  disabled: boolean;
  onSave: (name: string) => void;
}) => {
  const [name, setName] = useState(value);
  const changed = name.trim() !== value && name.trim().length > 0;
  return (
    <div className="flex flex-1 gap-2">
      <Input
        value={name}
        disabled={disabled}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && changed && onSave(name.trim())}
      />
      {changed && (
        <Button type="button" size="sm" disabled={disabled} onClick={() => onSave(name.trim())}>
          OK
        </Button>
      )}
    </div>
  );
};

/** Перестановка: перенумеровываем все записи */
const reorder = <T extends { id: number }>(items: T[], index: number, dir: -1 | 1) => {
  const next = [...items];
  [next[index], next[index + dir]] = [next[index + dir], next[index]];
  return next.map((item, i) => ({ id: item.id, sortOrder: i }));
};

const StatusesTab = ({
  statuses,
  reload,
}: {
  statuses: WorkStatusRef[];
  reload: () => Promise<unknown>;
}) => {
  const { busy, run } = useRunner(reload);
  const [newName, setNewName] = useState("");

  return (
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <CardTitle>Статусы работ</CardTitle>
        <CardDescription>
          Цвет — цвет карточки в календаре. Работы со статусами без галочки «В календаре» (например,
          «Удалено», «Архив») в календаре не показываются. Статус, который используется в работах,
          удалить нельзя.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {statuses.map((s, i) => (
          <div key={s.id} className="flex flex-wrap items-center gap-2 rounded-xl border p-2 dark:border-white/20">
            <span className={cn("rounded-full border px-2 py-0.5 text-xs", getStatusClasses(s.color))}>
              {s.name}
            </span>
            <NameInput
              value={s.name}
              disabled={busy}
              onSave={(name) => run(() => directoriesApi.updateWorkStatus(s.id, { name }), "Сохранено")}
            />
            <Select
              value={s.color}
              disabled={busy}
              onValueChange={(color) =>
                run(() => directoriesApi.updateWorkStatus(s.id, { color: color as StatusColor }))
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLORS.map((c) => (
                  <SelectItem key={c} value={c}>
                    <span className="flex items-center gap-2">
                      <span className={cn("h-3 w-3 rounded-full border", STATUS_COLOR_CLASSES[c])} />
                      {STATUS_COLOR_NAMES[c]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 text-sm whitespace-nowrap">
              <Checkbox
                checked={s.showInCalendar}
                disabled={busy}
                onCheckedChange={(v) =>
                  run(() => directoriesApi.updateWorkStatus(s.id, { showInCalendar: v === true }))
                }
              />
              В календаре
            </label>
            <div className="flex">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={busy || i === 0}
                onClick={() =>
                  run(() =>
                    Promise.all(
                      reorder(statuses, i, -1).map((r) =>
                        directoriesApi.updateWorkStatus(r.id, { sortOrder: r.sortOrder }),
                      ),
                    ),
                  )
                }
              >
                <ArrowUpIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={busy || i === statuses.length - 1}
                onClick={() =>
                  run(() =>
                    Promise.all(
                      reorder(statuses, i, 1).map((r) =>
                        directoriesApi.updateWorkStatus(r.id, { sortOrder: r.sortOrder }),
                      ),
                    ),
                  )
                }
              >
                <ArrowDownIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={busy}
                title="Удалить"
                onClick={() =>
                  confirm(`Удалить статус «${s.name}»?`) &&
                  run(() => directoriesApi.deleteWorkStatus(s.id), "Статус удалён")
                }
              >
                <Trash2Icon className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}

        <form
          className="flex gap-2 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            const name = newName.trim();
            if (!name) return;
            run(async () => {
              await directoriesApi.createWorkStatus({ name });
              setNewName("");
            }, "Статус добавлен");
          }}
        >
          <Input
            placeholder="Новый статус"
            value={newName}
            disabled={busy}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button type="submit" disabled={busy || !newName.trim()}>
            <PlusIcon className="mr-2 h-4 w-4" /> Добавить
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const TypesTab = ({ types, reload }: { types: WorkTypeRef[]; reload: () => Promise<unknown> }) => {
  const { busy, run } = useRunner(reload);
  const [newName, setNewName] = useState("");

  return (
    <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <CardHeader>
        <CardTitle>Типы работ</CardTitle>
        <CardDescription>Тип, который используется в работах, удалить нельзя.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {types.map((t, i) => (
          <div key={t.id} className="flex items-center gap-2 rounded-xl border p-2 dark:border-white/20">
            <NameInput
              value={t.name}
              disabled={busy}
              onSave={(name) => run(() => directoriesApi.updateWorkType(t.id, { name }), "Сохранено")}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={busy || i === 0}
              onClick={() =>
                run(() =>
                  Promise.all(
                    reorder(types, i, -1).map((r) =>
                      directoriesApi.updateWorkType(r.id, { sortOrder: r.sortOrder }),
                    ),
                  ),
                )
              }
            >
              <ArrowUpIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={busy || i === types.length - 1}
              onClick={() =>
                run(() =>
                  Promise.all(
                    reorder(types, i, 1).map((r) =>
                      directoriesApi.updateWorkType(r.id, { sortOrder: r.sortOrder }),
                    ),
                  ),
                )
              }
            >
              <ArrowDownIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={busy}
              title="Удалить"
              onClick={() =>
                confirm(`Удалить тип «${t.name}»?`) &&
                run(() => directoriesApi.deleteWorkType(t.id), "Тип удалён")
              }
            >
              <Trash2Icon className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}

        <form
          className="flex gap-2 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            const name = newName.trim();
            if (!name) return;
            run(async () => {
              await directoriesApi.createWorkType({ name });
              setNewName("");
            }, "Тип добавлен");
          }}
        >
          <Input
            placeholder="Новый тип работ"
            value={newName}
            disabled={busy}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button type="submit" disabled={busy || !newName.trim()}>
            <PlusIcon className="mr-2 h-4 w-4" /> Добавить
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export const DirectoriesPage = () => {
  const { statuses, types, isLoading, reload } = useWorkDirectories();

  return (
    <PermissionGuard permission="directories:manage">
      <div className="flex flex-col gap-4 pb-28">
        <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
          <CardHeader>
            <CardTitle>Справочники</CardTitle>
          </CardHeader>
        </Card>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
        ) : (
          <Tabs defaultValue="statuses">
            <TabsList>
              <TabsTrigger value="statuses">Статусы работ</TabsTrigger>
              <TabsTrigger value="types">Типы работ</TabsTrigger>
            </TabsList>
            <TabsContent value="statuses">
              <StatusesTab statuses={statuses} reload={reload} />
            </TabsContent>
            <TabsContent value="types">
              <TypesTab types={types} reload={reload} />
            </TabsContent>
          </Tabs>
        )}

        <BottomBar hideSaveButton />
      </div>
    </PermissionGuard>
  );
};
