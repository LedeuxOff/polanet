import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/lib/types";

interface Props {
  user: User;
  handleUnbindTelegram: () => Promise<void>;
  isUnbindingTelegram: boolean;
  isOwnUser: boolean;
}

export const UserDetailPageTelegramController = ({
  user,
  handleUnbindTelegram,
  isUnbindingTelegram,
  isOwnUser,
}: Props) => {
  return (
    <div className="col-span-3 space-y-2">
      <Label htmlFor="telegramChatId">Telegram Chat ID</Label>
      <div className="flex gap-2">
        <Input
          className="rounded-2xl flex-1 dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
          id="telegramChatId"
          value={user?.telegramChatId || ""}
          disabled
          placeholder="Не привязан"
        />

        {user?.telegramChatId && (isOwnUser || user?.roleCode === "DEVELOPER") && (
          <Button
            type="button"
            disabled={isUnbindingTelegram}
            onClick={handleUnbindTelegram}
            className="rounded-2xl bg-red-400 hover:bg-red-500 px-4 dark:bg-red-500/40 dark:text-white dark:hover:bg-red-500/60"
          >
            {isUnbindingTelegram ? "Отвязываю..." : "Отвязать"}
          </Button>
        )}
      </div>
    </div>
  );
};
