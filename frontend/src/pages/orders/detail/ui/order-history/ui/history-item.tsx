import { OrderHistory } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ArrowRightIcon,
  BanknoteIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";
import { ReactNode } from "react";
import { actionMeta, fallbackActionClass } from "../consts";
import { getHistoryUserName, getTime } from "../utils";

const actionIcons: Record<string, ReactNode> = {
  created: <PlusIcon className="h-3.5 w-3.5" />,
  updated: <PencilIcon className="h-3.5 w-3.5" />,
  status_changed: <RefreshCwIcon className="h-3.5 w-3.5" />,
  payment_added: <BanknoteIcon className="h-3.5 w-3.5" />,
  payment_removed: <BanknoteIcon className="h-3.5 w-3.5" />,
  deleted: <Trash2Icon className="h-3.5 w-3.5" />,
};

interface Props {
  item: OrderHistory;
  isLast: boolean;
}

export const HistoryItem = ({ item, isLast }: Props) => {
  const meta = actionMeta[item.action];
  const userName = getHistoryUserName(item);

  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      {!isLast && (
        <span className="absolute left-[13px] top-8 bottom-0 w-px bg-border dark:bg-white/15" />
      )}

      <span
        className={cn(
          "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-4 ring-background dark:ring-transparent",
          meta?.className ?? fallbackActionClass,
        )}
      >
        {actionIcons[item.action] ?? <PencilIcon className="h-3.5 w-3.5" />}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="text-sm font-medium">{meta?.label ?? item.action}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {userName && (
              <span className="inline-flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                {userName}
              </span>
            )}
            <span>{getTime(item.createdAt)}</span>
          </div>
        </div>

        {item.fieldName && (
          <div className="flex flex-col gap-1.5 rounded-xl bg-muted/40 p-2.5 text-sm dark:bg-white/5">
            <span className="text-xs text-muted-foreground">{item.fieldName}</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {item.oldValue && (
                <span className="break-all rounded-md bg-red-50 px-1.5 py-0.5 text-red-700 line-through decoration-red-400/70 dark:bg-red-500/10 dark:text-red-300">
                  {item.oldValue}
                </span>
              )}
              {item.oldValue && item.newValue && (
                <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              )}
              {item.newValue && (
                <span className="break-all rounded-md bg-green-50 px-1.5 py-0.5 font-medium text-green-700 dark:bg-green-500/10 dark:text-green-300">
                  {item.newValue}
                </span>
              )}
              {!item.oldValue && !item.newValue && (
                <span className="text-muted-foreground">Значение очищено</span>
              )}
            </div>
          </div>
        )}

        {item.newValue && !item.fieldName && (
          <p className="break-words text-sm text-muted-foreground">{item.newValue}</p>
        )}
      </div>
    </li>
  );
};
