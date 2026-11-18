import { ReactNode, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookOpenIcon,
  CalendarIcon,
  CalendarOffIcon,
  CheckIcon,
  InfoIcon,
  ListChecksIcon,
  PlusIcon,
  ShapesIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BottomBar } from "@/components/bottom-bar";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { directoriesApi } from "@/lib/api";
import { useToast } from "@/lib/contexts/toast-context";
import { useIsMobile } from "@/hooks";
import type { StatusColor, WorkStatusRef, WorkTypeRef } from "@/lib/types";
import { cn } from "@/lib/utils";
import { STATUS_COLOR_CLASSES, STATUS_COLOR_NAMES, getStatusClasses } from "@/pages/works/consts";
import { useWorkDirectories } from "@/pages/works/use-directories";

const COLORS = Object.keys(STATUS_COLOR_CLASSES) as StatusColor[];

const glassCard =
  "rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20";
const glassInput =
  "rounded-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20";

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
      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Ошибка", "error");
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { busy, run };
};

/** Перестановка: перенумеровываем все записи */
const reorder = <T extends { id: number }>(items: T[], index: number, dir: -1 | 1) => {
  const next = [...items];
  [next[index], next[index + dir]] = [next[index + dir], next[index]];
  return next.map((item, i) => ({ id: item.id, sortOrder: i }));
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
    <div className="relative flex min-w-0 flex-1">
      <Input
        value={name}
        disabled={disabled}
        className={cn(glassInput, changed && "pr-11 border-primary/60 dark:border-primary/60")}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && changed) onSave(name.trim());
          if (e.key === "Escape") setName(value);
        }}
      />
      {changed && (
        <Button
          type="button"
          size="icon"
          title="Сохранить (Enter)"
          disabled={disabled}
          onClick={() => onSave(name.trim())}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-lg"
        >
          <CheckIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

const RowActions = ({
  busy,
  isFirst,
  isLast,
  onUp,
  onDown,
  onDelete,
}: {
  busy: boolean;
  isFirst: boolean;
  isLast: boolean;
  onUp: () => void;
  onDown: () => void;
  onDelete: () => void;
}) => (
  <div className="flex shrink-0 items-center gap-0.5">
    <Button
      type="button"
      size="icon"
      variant="ghost"
      title="Выше"
      disabled={busy || isFirst}
      onClick={onUp}
      className="h-8 w-8 rounded-lg"
    >
      <ArrowUpIcon className="h-4 w-4" />
    </Button>
    <Button
      type="button"
      size="icon"
      variant="ghost"
      title="Ниже"
      disabled={busy || isLast}
      onClick={onDown}
      className="h-8 w-8 rounded-lg"
    >
      <ArrowDownIcon className="h-4 w-4" />
    </Button>
    <Button
      type="button"
      size="icon"
      variant="ghost"
      title="Удалить"
      disabled={busy}
      onClick={onDelete}
      className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-500/20 dark:hover:text-red-200"
    >
      <Trash2Icon className="h-4 w-4" />
    </Button>
  </div>
);

const Position = ({ n }: { n: number }) => (
  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-xs font-semibold text-muted-foreground dark:bg-white/10">
    {n}
  </span>
);

const AddForm = ({
  placeholder,
  busy,
  onAdd,
}: {
  placeholder: string;
  busy: boolean;
  onAdd: (name: string) => Promise<boolean>;
}) => {
  const [value, setValue] = useState("");
  return (
    <form
      className="flex gap-2 rounded-2xl border border-dashed p-2 dark:border-white/20"
      onSubmit={async (e) => {
        e.preventDefault();
        const name = value.trim();
        if (!name) return;
        if (await onAdd(name)) setValue("");
      }}
    >
      <Input
        placeholder={placeholder}
        value={value}
        disabled={busy}
        className={cn(glassInput, "border-0 shadow-none focus-visible:ring-0 dark:border-0")}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button type="submit" disabled={busy || !value.trim()} className="gap-1.5 rounded-xl">
        <PlusIcon className="h-4 w-4" /> Добавить
      </Button>
    </form>
  );
};

const Hint = ({ children }: { children: ReactNode }) => (
  <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground dark:bg-white/5">
    <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
    <div>{children}</div>
  </div>
);

const EmptyList = ({ text }: { text: string }) => (
  <p className="py-6 text-center text-sm text-muted-foreground">{text}</p>
);

const StatusesSection = ({
  statuses,
  reload,
}: {
  statuses: WorkStatusRef[];
  reload: () => Promise<unknown>;
}) => {
  const { busy, run } = useRunner(reload);
  const move = (i: number, dir: -1 | 1) =>
    run(() =>
      Promise.all(
        reorder(statuses, i, dir).map((r) =>
          directoriesApi.updateWorkStatus(r.id, { sortOrder: r.sortOrder }),
        ),
      ),
    );

  return (
    <div className="flex flex-col gap-3">
      <Hint>
        Цвет — цвет карточки в календаре. Работы со статусами, скрытыми из календаря (например,
        «Удалено», «Архив»), в календаре не показываются. Статус, который используется в работах,
        удалить нельзя.
      </Hint>

      {statuses.length === 0 && <EmptyList text="Статусов пока нет" />}

      {statuses.map((s, i) => (
        <div
          key={s.id}
          className="flex flex-col gap-3 rounded-2xl border p-3 transition-colors hover:bg-muted/30 dark:border-white/20 dark:hover:bg-white/5"
        >
          <div className="flex items-center gap-2">
            <Position n={i + 1} />
            <NameInput
              key={s.name}
              value={s.name}
              disabled={busy}
              onSave={(name) =>
                run(() => directoriesApi.updateWorkStatus(s.id, { name }), "Сохранено")
              }
            />
            <RowActions
              busy={busy}
              isFirst={i === 0}
              isLast={i === statuses.length - 1}
              onUp={() => move(i, -1)}
              onDown={() => move(i, 1)}
              onDelete={() =>
                confirm(`Удалить статус «${s.name}»?`) &&
                run(() => directoriesApi.deleteWorkStatus(s.id), "Статус удалён")
              }
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pl-10">
            <div className="flex flex-wrap items-center gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={STATUS_COLOR_NAMES[c]}
                  disabled={busy}
                  onClick={() =>
                    c !== s.color && run(() => directoriesApi.updateWorkStatus(s.id, { color: c }))
                  }
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border transition-transform hover:scale-110 disabled:opacity-50",
                    STATUS_COLOR_CLASSES[c],
                    s.color === c &&
                      "ring-2 ring-primary ring-offset-2 ring-offset-background dark:ring-white/80",
                  )}
                >
                  {s.color === c && <CheckIcon className="h-3 w-3" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  getStatusClasses(s.color),
                )}
              >
                {s.name}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  run(() =>
                    directoriesApi.updateWorkStatus(s.id, { showInCalendar: !s.showInCalendar }),
                  )
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50",
                  s.showInCalendar
                    ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-200 dark:hover:bg-green-500/30"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10",
                )}
                title="Показывать работы с этим статусом в календаре"
              >
                {s.showInCalendar ? (
                  <CalendarIcon className="h-3.5 w-3.5" />
                ) : (
                  <CalendarOffIcon className="h-3.5 w-3.5" />
                )}
                {s.showInCalendar ? "В календаре" : "Скрыт"}
              </button>
            </div>
          </div>
        </div>
      ))}

      <AddForm
        placeholder="Новый статус"
        busy={busy}
        onAdd={(name) => run(() => directoriesApi.createWorkStatus({ name }), "Статус добавлен")}
      />
    </div>
  );
};

const TypesSection = ({
  types,
  reload,
}: {
  types: WorkTypeRef[];
  reload: () => Promise<unknown>;
}) => {
  const { busy, run } = useRunner(reload);
  const move = (i: number, dir: -1 | 1) =>
    run(() =>
      Promise.all(
        reorder(types, i, dir).map((r) =>
          directoriesApi.updateWorkType(r.id, { sortOrder: r.sortOrder }),
        ),
      ),
    );

  return (
    <div className="flex flex-col gap-3">
      <Hint>Тип, который используется в работах, удалить нельзя.</Hint>

      {types.length === 0 && <EmptyList text="Типов пока нет" />}

      {types.map((t, i) => (
        <div
          key={t.id}
          className="flex items-center gap-2 rounded-2xl border p-3 transition-colors hover:bg-muted/30 dark:border-white/20 dark:hover:bg-white/5"
        >
          <Position n={i + 1} />
          <NameInput
            key={t.name}
            value={t.name}
            disabled={busy}
            onSave={(name) => run(() => directoriesApi.updateWorkType(t.id, { name }), "Сохранено")}
          />
          <RowActions
            busy={busy}
            isFirst={i === 0}
            isLast={i === types.length - 1}
            onUp={() => move(i, -1)}
            onDown={() => move(i, 1)}
            onDelete={() =>
              confirm(`Удалить тип «${t.name}»?`) &&
              run(() => directoriesApi.deleteWorkType(t.id), "Тип удалён")
            }
          />
        </div>
      ))}

      <AddForm
        placeholder="Новый тип работ"
        busy={busy}
        onAdd={(name) => run(() => directoriesApi.createWorkType({ name }), "Тип добавлен")}
      />
    </div>
  );
};

type TabKey = "statuses" | "types";

export const DirectoriesPage = () => {
  const { statuses, types, isLoading, reload } = useWorkDirectories();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<TabKey>("statuses");

  const tabs: {
    key: TabKey;
    label: string;
    icon: ReactNode;
    count: number;
    description: string;
  }[] = [
    {
      key: "statuses",
      label: "Статусы работ",
      icon: <ListChecksIcon className="h-4 w-4" />,
      count: statuses.length,
      description: "Этапы работ, их цвет и видимость в календаре",
    },
    {
      key: "types",
      label: "Типы работ",
      icon: <ShapesIcon className="h-4 w-4" />,
      count: types.length,
      description: "Виды работ, доступные при создании",
    },
  ];
  const active = tabs.find((t) => t.key === tab)!;

  return (
    <PermissionGuard permission="directories:manage">
      <div className="flex flex-col gap-4 pb-28">
        <Card className={glassCard}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
                <BookOpenIcon className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle>Справочники</CardTitle>
                <CardDescription>Настройка статусов и типов работ по стяжке</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-2")}>
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-4 text-left shadow-sm transition-colors dark:border-white/20",
                tab === t.key
                  ? "border-primary bg-primary/5 dark:border-white/60 dark:bg-white/15"
                  : "bg-card hover:bg-muted/40 dark:bg-white/5 dark:hover:bg-white/10",
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  tab === t.key
                    ? "bg-primary text-primary-foreground dark:bg-white/20 dark:text-white"
                    : "bg-muted/60 text-muted-foreground dark:bg-white/10",
                )}
              >
                {t.icon}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-semibold">{t.label}</span>
                <span className="truncate text-xs text-muted-foreground">{t.description}</span>
              </div>
              <span className="text-2xl font-bold tabular-nums">{isLoading ? "…" : t.count}</span>
            </button>
          ))}
        </div>

        <Card className={glassCard}>
          <CardHeader>
            <CardTitle>{active.label}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Загрузка...</div>
            ) : tab === "statuses" ? (
              <StatusesSection statuses={statuses} reload={reload} />
            ) : (
              <TypesSection types={types} reload={reload} />
            )}
          </CardContent>
        </Card>

        <BottomBar hideSaveButton />
      </div>
    </PermissionGuard>
  );
};
