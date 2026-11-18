import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { barButton } from "../styles";

interface Props {
  onHide: () => void;
}

export const BottomBarHideButton = ({ onHide }: Props) => (
  <button
    type="button"
    onClick={onHide}
    title="Скрыть панель"
    aria-label="Скрыть панель"
    className={cn(barButton.secondary, barButton.icon, "w-10 bg-transparent dark:bg-transparent")}
  >
    <ChevronDown />
  </button>
);
