import { TransportCard } from "@/lib/types";
import { useState, useMemo } from "react";
import {
  ArrowRightIcon,
  HistoryIcon,
  MinusCircleIcon,
  PencilIcon,
  PlusCircleIcon,
  PowerIcon,
  SparklesIcon,
  Trash2Icon,
  UserCheckIcon,
  UserMinusIcon,
} from "lucide-react";
import { MiniPager } from "@/components/data-list";
import { cn } from "@/lib/utils";
import { ComponentType } from "react";

interface Props {
  card: TransportCard | null;
}

const ITEMS_PER_PAGE = 5;

const ACTIONS: Record<
  string,
  { label: string; Icon: ComponentType<{ className?: string }>; tone: string }
> = {
  created: {
    label: "Карта создана",
    Icon: SparklesIcon,
    tone: "bg-blue-100 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300",
  },
  updated: {
    label: "Изменена",
    Icon: PencilIcon,
    tone: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200",
  },
  deleted: {
    label: "Удалена",
    Icon: Trash2Icon,
    tone: "bg-red-100 text-red-600 dark:bg-red-400/15 dark:text-red-300",
  },
  expense_added: {
    label: "Расход добавлен",
    Icon: PlusCircleIcon,
    tone: "bg-orange-100 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300",
  },
  expense_removed: {
    label: "Расход удалён",
    Icon: MinusCircleIcon,
    tone: "bg-orange-100 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300",
  },
  driver_assigned: {
    label: "Водитель назначен",
    Icon: UserCheckIcon,
    tone: "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300",
  },
  driver_unassigned: {
    label: "Водитель откреплён",
    Icon: UserMinusIcon,
    tone: "bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300",
  },
  status_changed: {
    label: "Статус изменён",
    Icon: PowerIcon,
    tone: "bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300",
  },
};

export const TransportCardHistory = ({ card }: Props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const history = card?.history || [];

  const totalPages = Math.max(1, Math.ceil(history.length / ITEMS_PER_PAGE));

  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return history.slice(start, start + ITEMS_PER_PAGE);
  }, [history, currentPage]);

  if (!history.length) {
    return (
      <div className="col-span-full flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center dark:border-white/20">
        <HistoryIcon className="h-6 w-6 text-slate-300 dark:text-slate-500" />
        <span className="text-sm text-slate-500 dark:text-slate-400">Изменений пока нет</span>
      </div>
    );
  }

  return (
    <div className="col-span-full flex flex-col gap-4">
      <ol className="relative flex flex-col gap-4 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-px before:bg-slate-200 dark:before:bg-white/15">
        {paginatedHistory.map((item) => {
          const action = ACTIONS[item.action] ?? ACTIONS.updated;
          const userName = [
            item.userLastName,
            item.userFirstName && item.userFirstName.charAt(0) + ".",
            item.userMiddleName && item.userMiddleName.charAt(0) + ".",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li key={item.id} className="relative flex gap-3">
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-4 ring-white dark:ring-transparent",
                  action.tone,
                )}
              >
                <action.Icon className="h-4 w-4" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {action.label}
                  </span>
                  <span className="text-xs tabular-nums text-slate-400">
                    {new Date(item.createdAt).toLocaleString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {userName && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">{userName}</span>
                )}
                {item.fieldName && (item.oldValue || item.newValue) && (
                  <div className="mt-1 flex w-fit flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 text-sm dark:bg-white/5">
                    {item.oldValue && (
                      <span className="text-slate-400 line-through">{item.oldValue}</span>
                    )}
                    {item.oldValue && item.newValue && (
                      <ArrowRightIcon className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    {item.newValue && (
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {item.newValue}
                      </span>
                    )}
                  </div>
                )}
                {item.newValue && !item.fieldName && (
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    {item.newValue}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <MiniPager page={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
    </div>
  );
};
