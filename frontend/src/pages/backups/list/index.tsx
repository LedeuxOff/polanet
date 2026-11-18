import {
  ArchiveRestoreIcon,
  DatabaseBackupIcon,
  DatabaseIcon,
  HardDriveIcon,
  HistoryIcon,
  Loader2Icon,
  Trash2Icon,
} from "lucide-react";
import { useIsMobile } from "@/hooks";
import { BottomBar } from "@/components/bottom-bar";
import {
  listCardClass,
  ListEmptyState,
  ListPageHead,
  listTdClass as td,
  listThClass as th,
  Shimmer,
} from "@/components/data-list";
import { cn } from "@/lib/utils";
import { useBackupsListPage } from "./hooks";

const tone = "bg-slate-200 text-slate-700 dark:bg-white/15 dark:text-slate-200";

/** «5 мин назад», «3 ч назад», «2 дн назад» */
const formatRelative = (value: string) => {
  const diff = Date.now() - new Date(value).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин назад`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.round(h / 24);
  return `${d} дн назад`;
};

const Tile = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className={cn(listCardClass, "flex items-center gap-3 p-4")}>
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300 [&>svg]:h-5 [&>svg]:w-5">
      {icon}
    </div>
    <div className="flex min-w-0 flex-col">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className="truncate text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">
        {value}
      </span>
    </div>
  </div>
);

export const BackupsPage = () => {
  const isMobile = useIsMobile();
  const {
    backups,
    isLoading,
    isCreating,
    isRestoring,
    isDeleting,
    handleCreate,
    handleRestore,
    handleDelete,
    formatFileSize,
    formatDate,
    canCreate,
    canRestore,
    canDelete,
  } = useBackupsListPage();

  const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
  const latest = backups[0];

  const actions = (filename: string, full = false) => (
    <div className={cn("flex items-center gap-2", full && "w-full")}>
      {canRestore && (
        <button
          type="button"
          onClick={() => handleRestore(filename)}
          disabled={!!isRestoring}
          title="Восстановить базу данных из этой копии"
          className={cn(
            "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-blue-50 px-3 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50 dark:bg-blue-500/15 dark:text-blue-200 dark:hover:bg-blue-500/25",
            full && "flex-1",
          )}
        >
          {isRestoring === filename ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <ArchiveRestoreIcon className="h-4 w-4" />
          )}
          {isRestoring === filename ? "Восстановление..." : "Восстановить"}
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          onClick={() => handleDelete(filename)}
          disabled={isDeleting === filename}
          title="Удалить резервную копию"
          aria-label="Удалить резервную копию"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/20 dark:hover:text-red-200"
        >
          {isDeleting === filename ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2Icon className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );

  const LatestBadge = () => (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200">
      Последняя
    </span>
  );

  return (
    <div className="flex flex-col gap-4">
      <ListPageHead
        icon={<DatabaseBackupIcon />}
        iconClassName={tone}
        title="Резервные копии"
        description="Снимки базы данных и восстановление из них"
      />

      {/* Сводка */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Tile
          icon={<DatabaseIcon />}
          label="Копий"
          value={isLoading ? "…" : String(backups.length)}
        />
        <Tile
          icon={<HardDriveIcon />}
          label="Занимают"
          value={isLoading ? "…" : formatFileSize(totalSize)}
        />
        <div className="col-span-2 lg:col-span-1">
          <Tile
            icon={<HistoryIcon />}
            label="Последняя копия"
            value={isLoading ? "…" : latest ? formatRelative(latest.createdAt) : "—"}
          />
        </div>
      </div>

      {/* Список */}
      {!isLoading && backups.length === 0 ? (
        <ListEmptyState
          icon={<DatabaseIcon />}
          title="Резервных копий пока нет"
          text={canCreate ? "Создайте первую копию кнопкой внизу" : "Копии появятся здесь"}
        />
      ) : isMobile ? (
        <div className="flex flex-col gap-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Shimmer key={i} className="h-32 w-full rounded-3xl" />
              ))
            : backups.map((b, i) => (
                <div key={b.filename} className={cn(listCardClass, "flex flex-col gap-3 p-4")}>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                        tone,
                      )}
                    >
                      <DatabaseIcon className="h-5 w-5" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatDate(b.createdAt)}
                        </span>
                        {i === 0 && <LatestBadge />}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatRelative(b.createdAt)} · {formatFileSize(b.size)}
                      </span>
                    </div>
                  </div>
                  <span className="truncate rounded-xl bg-slate-50 px-3 py-2 font-mono text-xs text-slate-500 dark:bg-white/5 dark:text-slate-400">
                    {b.filename}
                  </span>
                  {(canRestore || canDelete) && actions(b.filename, true)}
                </div>
              ))}
        </div>
      ) : (
        <div className={cn(listCardClass, "overflow-hidden")}>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-white/15 dark:bg-white/5">
                <tr>
                  <th className={th}>Копия</th>
                  <th className={th}>Создана</th>
                  <th className={cn(th, "text-right")}>Размер</th>
                  {(canRestore || canDelete) && <th className={cn(th, "text-right")}>Действия</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td className={td}>
                          <div className="flex items-center gap-3">
                            <Shimmer className="h-9 w-9 rounded-xl" />
                            <Shimmer className="h-4 w-64" />
                          </div>
                        </td>
                        <td className={td}>
                          <Shimmer className="h-4 w-32" />
                        </td>
                        <td className={td}>
                          <Shimmer className="ml-auto h-4 w-14" />
                        </td>
                        {(canRestore || canDelete) && (
                          <td className={td}>
                            <Shimmer className="ml-auto h-9 w-36 rounded-xl" />
                          </td>
                        )}
                      </tr>
                    ))
                  : backups.map((b, i) => (
                      <tr
                        key={b.filename}
                        className="transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                      >
                        <td className={td}>
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                                tone,
                              )}
                            >
                              <DatabaseIcon className="h-4 w-4" />
                            </div>
                            <span className="font-mono text-xs text-slate-700 dark:text-slate-200">
                              {b.filename}
                            </span>
                            {i === 0 && <LatestBadge />}
                          </div>
                        </td>
                        <td className={td}>
                          <div className="flex flex-col">
                            <span className="whitespace-nowrap font-medium text-slate-700 dark:text-slate-200">
                              {formatDate(b.createdAt)}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {formatRelative(b.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td
                          className={cn(
                            td,
                            "whitespace-nowrap text-right tabular-nums text-slate-600 dark:text-slate-300",
                          )}
                        >
                          {formatFileSize(b.size)}
                        </td>
                        {(canRestore || canDelete) && (
                          <td className={cn(td, "py-2")}>
                            <div className="flex justify-end">{actions(b.filename)}</div>
                          </td>
                        )}
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BottomBar
        hideSaveButton={!canCreate}
        onCreate={canCreate ? handleCreate : undefined}
        createLabel={isCreating ? "Создание..." : "Создать копию"}
        createDisabled={isCreating}
      />
    </div>
  );
};
