import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface Props {
  disabled?: boolean;
  onClick: () => void;
}

export const BottomBarBackButton = ({ disabled, onClick }: Props) => {
  return (
    <Button
      type="button"
      disabled={disabled}
      className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600 dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
      onClick={onClick}
    >
      <ChevronLeft className="w-4 h-4 dark:text-zinc-100" />
    </Button>
  );
};
