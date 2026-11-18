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
import { listCardClass, ListPageHead, SectionCard, Shimmer } from "@/components/data-list";
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

const glassInput =
  "h-10 rounded-xl border-slate-200 bg-white dark:border-white/20 dark:bg-white/10 dark:backdrop-blur-xl";

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
        className={cn(
          glassInput,
          changed &&
            "pr-11 border-blue-400 ring-2 ring-blue-100 dark:border-blue-400/60 dark:ring-blue-400/20",
        )}
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
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500/80"
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
      className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
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
      className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
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
      className="h-8 w-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-200"
    >
      <Trash2Icon className="h-4 w-4" />
    </Button>
  </div>
);

const Position = ({ n }: { n: number }) => (
  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold tabular-nums text-slate-500 dark:bg-white/10 dark:text-slate-300">
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
      className="flex gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-2 transition-colors focus-within:border-blue-300 focus-within:bg-white dark:border-white/20 dark:bg-transparent"
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
        className={cn(
          glassInput,
          "border-0 bg-transparent shadow-none focus-visible:ring-0 dark:border-0 dark:bg-transparent",
        )}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button
        type="submit"
        disabled={busy || !value.trim()}
        className="h-10 gap-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500/80 dark:hover:bg-blue-500"
      >
        <PlusIcon className="h-4 w-4" /> Добавить
      </Button>
    </form>
  );
};

const Hint = ({ children }: { children: ReactNode }) => (
  <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50/70 p-3 text-sm text-slate-600 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-slate-300">
    <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-500 dark:text-blue-300" />
    <div>{children}</div>
  </div>
);

const EmptyList = ({ text }: { text: string }) => (
  <p className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-white/20 dark:text-slate-400">
    {text}
  </p>
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
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300 dark:border-white/15 dark:bg-white/5 dark:hover:border-white/25"
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
                      "ring-2 ring-blue-500 ring-offset-2 ring-offset-background dark:ring-white/80",
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
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:hover:bg-emerald-500/30"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10",
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
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300 dark:border-white/15 dark:bg-white/5 dark:hover:border-white/25"
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
      icon: <ListChecksIcon className="h-5 w-5" />,
      count: statuses.length,
      description: "Этапы работ, их цвет и видимость в календаре",
    },
    {
      key: "types",
      label: "Типы работ",
      icon: <ShapesIcon className="h-5 w-5" />,
      count: types.length,
      description: "Виды работ, доступные при создании",
    },
  ];
  const active = tabs.find((t) => t.key === tab)!;

  const tones: Record<TabKey, string> = {
    statuses: "bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300",
    types: "bg-cyan-100 text-cyan-600 dark:bg-cyan-400/15 dark:text-cyan-300",
  };

  return (
    <PermissionGuard permission="directories:manage">
      <div className="flex flex-col gap-4">
        <ListPageHead
          icon={<BookOpenIcon />}
          iconClassName="bg-indigo-100 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-300"
          title="Справочники"
          description="Настройка статусов и типов работ по стяжке"
        />

        <div className="grid grid-cols-2 gap-3">
          {tabs.map((t) => {
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                aria-pressed={isActive}
                className={cn(
                  listCardClass,
                  "flex items-center gap-3 p-4 text-left transition-all",
                  isMobile && "flex-col items-start gap-2",
                  isActive
                    ? "border-blue-400 ring-2 ring-blue-100 dark:border-white/50 dark:ring-white/10"
                    : "hover:border-slate-300 dark:hover:bg-white/15",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    tones[t.key],
                  )}
                >
                  {t.icon}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {t.label}
                  </span>
                  {!isMobile && (
                    <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {t.description}
                    </span>
                  )}
                </div>
                {!isMobile && (
                  <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    {isLoading ? "…" : t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <SectionCard
          icon={active.icon}
          iconClassName={tones[active.key]}
          title={active.label}
          description={isLoading ? undefined : `${active.description} · ${active.count} шт.`}
        >
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Shimmer key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : tab === "statuses" ? (
            <StatusesSection statuses={statuses} reload={reload} />
          ) : (
            <TypesSection types={types} reload={reload} />
          )}
        </SectionCard>

        <BottomBar hideSaveButton />
      </div>
    </PermissionGuard>
  );
};
