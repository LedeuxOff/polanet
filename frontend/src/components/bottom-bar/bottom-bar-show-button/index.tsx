import { cn } from "@/lib/utils";
import { ChevronUp } from "lucide-react";
import { HTMLAttributes } from "react";

export const BottomBarShowButton = ({
  hideBottomTabbar,
  setHideBottomTabbar,
  className,
}: {
  hideBottomTabbar: boolean;
  setHideBottomTabbar: (value: boolean) => void;
  className?: HTMLAttributes<HTMLDivElement>["className"];
}) => {
  return (
    <div
      onClick={() => setHideBottomTabbar(false)}
      className={cn(
        "absolute -top-4 left-1/2 -translate-x-1/2 px-1 pb-2 bg-[rgb(194,194,197)] rounded-2xl hover:bg-[rgb(173,173,176)] flex items-center justify-center cursor-pointer z-10 transition-all dark:bg-zinc-500 dark:backdrop-blur-xl",
        hideBottomTabbar ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      <ChevronUp className="text-white w-5" />
    </div>
  );
};
