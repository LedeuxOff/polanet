import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks";
import { listCardClass } from "./styles";

const DEFAULT_PAGE_OPTIONS = [1, 5, 10, 25, 50] as const;

interface Props {
  pageOptions?: readonly number[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

/** Номера страниц с многоточиями: 1 … 4 5 6 … 12 */
const getPages = (current: number, total: number): (number | "dots")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "dots")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("dots");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("dots");
  pages.push(total);
  return pages;
};

const btn =
  "flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-medium tabular-nums transition-colors disabled:pointer-events-none disabled:opacity-40";

export const ListPagination = ({
  pageOptions = DEFAULT_PAGE_OPTIONS,
  currentPage,
  totalPages,
  totalRecords,
  limit,
  onPageChange,
  onLimitChange,
}: Props) => {
  const isMobile = useIsMobile();

  if (!totalRecords) return null;

  const pages = Math.max(totalPages, 1);
  const from = (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, totalRecords);

  const limitSelect = (
    <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
      <SelectTrigger className="h-9 w-auto gap-2 rounded-xl border-slate-200 bg-slate-50 pl-3 text-sm dark:border-white/20 dark:bg-white/10">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-2xl shadow-xl dark:border-white/20 dark:bg-zinc-900/90 dark:backdrop-blur-xl">
        {pageOptions.map((option) => (
          <SelectItem key={option} value={String(option)} className="rounded-xl">
            по {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (isMobile) {
    const navBtn =
      "flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition-colors active:bg-slate-100 disabled:pointer-events-none disabled:opacity-30 dark:text-slate-200 dark:active:bg-white/10";

    return (
      <div
        className={cn(
          listCardClass,
          "mb-4 flex items-center justify-between gap-2 py-1.5 pl-4 pr-1.5",
        )}
      >
        <span className="text-xs text-slate-500 dark:text-slate-300">
          <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
            {from}–{to}
          </span>{" "}
          из <span className="tabular-nums">{totalRecords}</span>
        </span>

        <div className="flex items-center gap-1">
          {limitSelect}
          <div className="flex items-center rounded-2xl bg-slate-50 dark:bg-white/5">
            <button
              type="button"
              className={navBtn}
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Предыдущая страница"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span className="min-w-10 text-center text-xs font-medium tabular-nums text-slate-900 dark:text-slate-100">
              {currentPage} / {pages}
            </span>
            <button
              type="button"
              className={navBtn}
              disabled={currentPage >= pages}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Следующая страница"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        listCardClass,
        "mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:pl-5",
      )}
    >
      <div className="flex items-center justify-between gap-3 sm:justify-start">
        <span className="text-sm text-slate-500 dark:text-slate-300">
          <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
            {from}–{to}
          </span>{" "}
          из <span className="tabular-nums">{totalRecords}</span>
        </span>
        {limitSelect}
      </div>

      <div className="flex items-center justify-between gap-1 sm:justify-end">
        <button
          type="button"
          className={cn(
            btn,
            "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10",
          )}
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Предыдущая страница"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1">
          {getPages(currentPage, pages).map((p, i) =>
            p === "dots" ? (
              <span key={`d${i}`} className="px-1 text-slate-400">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  btn,
                  p === currentPage
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10",
                )}
              >
                {p}
              </button>
            ),
          )}
        </div>
        <button
          type="button"
          className={cn(
            btn,
            "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10",
          )}
          disabled={currentPage >= pages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Следующая страница"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
