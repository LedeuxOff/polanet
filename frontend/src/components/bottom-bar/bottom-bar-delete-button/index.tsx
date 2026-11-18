import { barButton } from "../styles";
import { Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  disabled?: boolean;
  handleDelete: (() => Promise<void>) | (() => void);
}

export const BottomBarDeleteButton = ({ disabled, handleDelete }: Props) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleDelete}
      title="Удалить"
      aria-label="Удалить"
      className={cn(barButton.danger, barButton.icon)}
    >
      <Trash2Icon />
    </button>
  );
};
