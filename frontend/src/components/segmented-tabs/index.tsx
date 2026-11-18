import { ComponentType } from "react";
import { useIsMobile } from "@/hooks";
import { cn } from "@/lib/utils";

export interface SegmentedTab<T extends string = string> {
  id: T;
  label: string;
  /** Короткая подпись для мобильной версии */
  short?: string;
  Icon?: ComponentType<{ className?: string }>;
}

interface Props<T extends string> {
  tabs: readonly SegmentedTab<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Переключатель вкладок со скользящим индикатором */
export const SegmentedTabs = <T extends string>({ tabs, value, onChange, className }: Props<T>) => {
  const isMobile = useIsMobile();
  const activeIndex = Math.max(
    tabs.findIndex((tab) => tab.id === value),
    0,
  );
  const count = tabs.length;

  return (
    <div
      role="tablist"
      className={cn(
        "relative grid w-full rounded-2xl bg-slate-200/70 p-1 sm:w-fit dark:bg-white/10",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="absolute bottom-1 left-1 top-1 rounded-xl bg-white shadow-sm transition-transform duration-300 ease-out dark:bg-white/15"
        style={{
          width: `calc((100% - 8px) / ${count})`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />

      {tabs.map(({ id, label, short, Icon }) => {
        const isActive = id === value;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={cn(
              "relative z-10 flex h-10 min-w-0 items-center justify-center gap-2 rounded-xl px-3 font-medium transition-colors sm:px-5",
              isMobile ? "text-xs" : "text-sm",
              isActive
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white",
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive && "text-blue-600 dark:text-blue-300",
                )}
              />
            )}
            <span className="truncate">{isMobile ? (short ?? label) : label}</span>
          </button>
        );
      })}
    </div>
  );
};
