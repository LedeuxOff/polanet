import { useMemo, useState } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  FileWarningIcon,
  RefreshCwIcon,
  SearchIcon,
  ServerCrashIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from "lucide-react";
import { BottomBar } from "@/components/bottom-bar";
import { barButton } from "@/components/bottom-bar/styles";
import { listCardClass, listFilterControlClass, Shimmer } from "@/components/data-list";
import { Input } from "@/components/ui/input";
import type { ServerError } from "@/lib/api/system-logs-api";
import { cn } from "@/lib/utils";
import { useSystemLogs } from "./hooks";

const METHOD_TONES: Record<string, string> = {
  GET: "bg-sky-100 text-sky-700 dark:bg-sky-400/20 dark:text-sky-200",
  POST: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200",
  PUT: "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200",
  PATCH: "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-400/20 dark:text-red-200",
};

const formatRelative = (value: string) => {
  const diff = Date.now() - new Date(value).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин назад`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} ч назад`;
  return `${Math.round(h / 24)} дн назад`;
};

const plural = (n: number) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "ошибка";
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "ошибки";
  return "ошибок";
};

const LogItem = ({
  err,
  formatTimestamp,
}: {
  err: ServerError;
  formatTimestamp: (t: string) => string;
}) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const method = err.method?.toUpperCase();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText([err.message, err.stack].filter(Boolean).join("\n\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* буфер обмена недоступен */
    }
  };

  return (
    <div className={cn(listCardClass, "flex flex-col overflow-hidden")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-start gap-3 p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-400/15 dark:text-red-300">
          <FileWarningIcon className="h-5 w-5" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {method && (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold",
                  METHOD_TONES[method] ??
                    "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
                )}
              >
                {method}
              </span>
            )}
            {err.endpoint && (
              <span className="truncate font-mono text-xs text-slate-600 dark:text-slate-300">
                {err.endpoint}
              </span>
            )}
          </div>
          <p
            className={cn(
              "break-words text-sm font-medium text-slate-900 dark:text-slate-100",
              !open && "line-clamp-2",
            )}
          >
            {err.message}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <span title={formatTimestamp(err.timestamp)}>{formatRelative(err.timestamp)}</span>
            <span className="tabular-nums">#{err.id}</span>
            {err.appVersion && <span>v{err.appVersion}</span>}
          </div>
        </div>
        <ChevronDownIcon
          className={cn(
            "mt-2 h-4 w-4 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-3 border-t border-slate-100 p-4 dark:border-white/10">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
            <dt className="text-slate-400">Время</dt>
            <dd className="tabular-nums text-slate-700 dark:text-slate-200">
              {formatTimestamp(err.timestamp)}
            </dd>
            {err.userAgent && (
              <>
                <dt className="text-slate-400">Клиент</dt>
                <dd className="break-all text-slate-700 dark:text-slate-200">{err.userAgent}</dd>
              </>
            )}
          </dl>
          {err.stack && (
            <div className="relative">
              <pre className="max-h-80 overflow-auto rounded-2xl bg-slate-900 p-4 pr-12 font-mono text-xs leading-relaxed text-slate-200 dark:bg-black/40">
                {err.stack}
              </pre>
              <button
                type="button"
                onClick={copy}
                title="Скопировать"
                aria-label="Скопировать ошибку"
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
              >
                {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const SystemLogsPage = () => {
  const {
    errors,
    isLoading,
    error,
    lastUpdated,
    refresh,
    clearAllErrors,
    formatTimestamp,
    canClearErrors,
  } = useSystemLogs();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return errors;
    return errors.filter((e) =>
      [e.message, e.endpoint, e.method, String(e.id)].some((v) => v?.toLowerCase().includes(term)),
    );
  }, [errors, search]);

  const firstLoad = isLoading && errors.length === 0 && !lastUpdated;

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          listCardClass,
          "flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6",
        )}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-400/15 dark:text-red-300">
            <ServerCrashIcon className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                Серверные логи
              </h1>
              {errors.length > 0 && (
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium tabular-nums text-red-700 dark:bg-red-400/20 dark:text-red-200">
                  {errors.length} {plural(errors.length)}
                </span>
              )}
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-300">
              Ошибки сервера с запросом и стеком вызовов
            </span>
          </div>
        </div>
        {lastUpdated && (
          <span className="w-fit rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
            Обновлено в <span className="tabular-nums">{lastUpdated}</span>
          </span>
        )}
      </div>

      {errors.length > 0 && (
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className={cn(listFilterControlClass, "pl-9 dark:border-white/20 dark:bg-white/10")}
            placeholder="Поиск по тексту, адресу запроса или номеру"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {firstLoad ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Shimmer key={i} className="h-24 w-full rounded-3xl" />
          ))}
        </div>
      ) : error && errors.length === 0 ? (
        <div
          className={cn(listCardClass, "flex flex-col items-center gap-3 px-6 py-12 text-center")}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-400/15 dark:text-red-300">
            <ServerCrashIcon className="h-6 w-6" />
          </div>
          <span className="font-medium text-slate-900 dark:text-slate-100">{error}</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Нажмите «Обновить», чтобы попробовать снова
          </span>
        </div>
      ) : errors.length === 0 ? (
        <div
          className={cn(listCardClass, "flex flex-col items-center gap-3 px-6 py-14 text-center")}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300">
            <ShieldCheckIcon className="h-6 w-6" />
          </div>
          <span className="font-medium text-slate-900 dark:text-slate-100">Ошибок нет</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Записей об ошибках пока нет
          </span>
        </div>
      ) : (
        <div className={cn("flex flex-col gap-3 transition-opacity", isLoading && "opacity-60")}>
          {filtered.map((err) => (
            <LogItem key={err.id} err={err} formatTimestamp={formatTimestamp} />
          ))}
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Ничего не найдено
            </div>
          )}
        </div>
      )}

      <BottomBar
        onCreate={refresh}
        createLabel={isLoading ? "Обновление..." : "Обновить"}
        createIcon={<RefreshCwIcon className={cn(isLoading && "animate-spin")} />}
        createDisabled={isLoading}
        extraRow={
          errors.length > 0 && canClearErrors ? (
            <button
              type="button"
              onClick={clearAllErrors}
              disabled={isLoading}
              className={cn(barButton.danger, "w-full")}
            >
              <Trash2Icon />
              Очистить все ошибки
            </button>
          ) : undefined
        }
      />
    </div>
  );
};
