import { barButton } from "../styles";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  disabled?: boolean;
  onClick: () => void;
}

export const BottomBarBackButton = ({ disabled, onClick }: Props) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title="Назад"
      aria-label="Назад"
      className={cn(barButton.secondary, barButton.icon)}
    >
      <ChevronLeft />
    </button>
  );
};
