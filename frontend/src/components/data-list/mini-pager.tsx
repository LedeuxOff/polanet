import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const btn =
  "flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-30 dark:text-slate-200 dark:hover:bg-white/10";

/** Компактный переключатель страниц для вложенных списков */
export const MiniPager = ({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex w-fit items-center self-center rounded-xl bg-slate-100 p-0.5 dark:bg-white/5">
      <button
        type="button"
        className={btn}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Предыдущая страница"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>
      <span className="min-w-12 text-center text-xs font-medium tabular-nums text-slate-700 dark:text-slate-200">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        className={btn}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Следующая страница"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
