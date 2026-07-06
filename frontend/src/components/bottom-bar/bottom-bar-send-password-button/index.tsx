import { Button } from "@/components/ui/button";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { Send } from "lucide-react";

interface Props {
  disabled?: boolean;
  handleSendPassword: () => Promise<void>;
  isSendingPassword?: boolean;
}

export const BottomBarSendPasswordButton = ({
  disabled,
  handleSendPassword,
  isSendingPassword,
}: Props) => {
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();

  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (!hasPermission("users:sendPassword")) {
          showToast("У вас нет прав на отправку пароля", "error");
          return;
        }
        handleSendPassword();
      }}
      className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600 dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20 dark:text-zinc-100"
    >
      <Send className="w-4 h-4 mr-2 dark:text-zinc-100" />
      {isSendingPassword ? "Отправка..." : "Выслать новый пароль"}
    </Button>
  );
};
