import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface Props {
  setHideBottomTabbar: Dispatch<SetStateAction<boolean>>;
}

export const BottomBarHideButton = ({ setHideBottomTabbar }: Props) => {
  return (
    <Button
      onClick={() => setHideBottomTabbar(true)}
      type="button"
      className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600 dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
    >
      <ChevronDown className="w-4 h-4 dark:text-zinc-100" />
    </Button>
  );
};
