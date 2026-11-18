import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader2Icon, SendIcon, UnlinkIcon } from "lucide-react";

interface Props {
  user: User;
  handleUnbindTelegram: () => Promise<void>;
  isUnbindingTelegram: boolean;
  isOwnUser: boolean;
  /** Переопределить, кому разрешено отвязывать */
  canUnbind?: boolean;
}

export const UserDetailPageTelegramController = ({
  user,
  handleUnbindTelegram,
  isUnbindingTelegram,
  isOwnUser,
  canUnbind: canUnbindProp,
}: Props) => {
  const isBound = !!user?.telegramChatId;
  const canUnbind = isBound && (canUnbindProp ?? (isOwnUser || user?.roleCode === "DEVELOPER"));

  return (
    <div className="col-span-full flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center dark:border-white/15 dark:bg-white/5">
      <div className="flex flex-1 items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            isBound
              ? "bg-sky-100 text-sky-600 dark:bg-sky-400/20 dark:text-sky-200"
              : "bg-slate-200 text-slate-400 dark:bg-white/10 dark:text-slate-400",
          )}
        >
          <SendIcon className="h-5 w-5" />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
            Telegram
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                isBound
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200"
                  : "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300",
              )}
            >
              {isBound ? "Привязан" : "Не привязан"}
            </span>
          </span>
          <span className="truncate text-xs text-slate-500 dark:text-slate-400">
            {isBound ? (
              <>
                Chat ID: <span className="font-mono">{user.telegramChatId}</span>
              </>
            ) : (
              "Без Telegram нельзя выслать новый пароль"
            )}
          </span>
        </div>
      </div>

      {canUnbind && (
        <button
          type="button"
          disabled={isUnbindingTelegram}
          onClick={handleUnbindTelegram}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-50 px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-500/20 dark:text-red-200 dark:hover:bg-red-500/30"
        >
          {isUnbindingTelegram ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <UnlinkIcon className="h-4 w-4" />
          )}
          {isUnbindingTelegram ? "Отвязываю..." : "Отвязать"}
        </button>
      )}
    </div>
  );
};
