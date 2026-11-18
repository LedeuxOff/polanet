import { barButton } from "../styles";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { Loader2Icon, Send } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (!hasPermission("users:sendPassword")) {
          showToast("У вас нет прав на отправку пароля", "error");
          return;
        }
        handleSendPassword();
      }}
      className={cn(barButton.secondary, "w-full")}
    >
      {isSendingPassword ? <Loader2Icon className="animate-spin" /> : <Send />}
      {isSendingPassword ? "Отправка..." : "Выслать новый пароль"}
    </button>
  );
};
