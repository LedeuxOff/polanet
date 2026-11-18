import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  visible: boolean;
  onShow: () => void;
  className?: string;
}

/** «Язычок», который остаётся внизу экрана, когда панель скрыта */
export const BottomBarShowButton = ({ visible, onShow, className }: Props) => (
  <button
    type="button"
    onClick={onShow}
    aria-label="Показать панель действий"
    tabIndex={visible ? 0 : -1}
    className={cn(
      "fixed bottom-[calc(env(safe-area-inset-bottom)+12px)] z-40 flex h-9 -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-900 pl-3 pr-4 text-xs font-medium text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200",
      visible ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      className,
    )}
  >
    <ChevronUp className="h-4 w-4" />
    Действия
  </button>
);
