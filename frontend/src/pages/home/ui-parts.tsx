import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/lib/contexts/permission-context";

const pulseColors = {
  blue: {
    ring: "bg-blue-300/30",
    ring2: "bg-blue-300/20",
    core: "bg-blue-300/10",
    icon: "text-blue-300",
  },
  yellow: {
    ring: "bg-yellow-300/30",
    ring2: "bg-yellow-300/20",
    core: "bg-yellow-300/10",
    icon: "text-yellow-300",
  },
  green: {
    ring: "bg-green-300/30",
    ring2: "bg-green-300/20",
    core: "bg-green-300/10",
    icon: "text-green-300",
  },
  cyan: {
    ring: "bg-cyan-300/30",
    ring2: "bg-cyan-300/20",
    core: "bg-cyan-300/10",
    icon: "text-cyan-300",
  },
} as const;

export const PulseIcon = ({
  color,
  children,
}: {
  color: keyof typeof pulseColors;
  children: ReactNode;
}) => {
  const c = pulseColors[color];
  return (
    <div className="absolute top-3 right-3">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div
          className={cn(
            "absolute inset-0 rounded-full animate-[pulse-ring-expand_2s_ease-in-out_infinite]",
            c.ring,
          )}
        />
        <div
          className={cn(
            "absolute inset-0 rounded-full animate-[pulse-ring-expand_2s_ease-in-out_infinite_1s]",
            c.ring2,
          )}
        />
        <div
          className={cn(
            "relative z-10 flex h-20 w-20 items-center justify-center rounded-full [&>svg]:h-10 [&>svg]:w-10",
            c.core,
            c.icon,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

interface StatTileProps {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
  valueClassName?: string;
}

export const StatTile = ({
  icon,
  label,
  value,
  hint,
  className,
  valueClassName,
}: StatTileProps) => (
  <div
    className={cn(
      "flex flex-col gap-1 rounded-2xl border border-white/20 bg-white/5 p-3",
      className,
    )}
  >
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground dark:text-slate-300">
      {icon}
      {label}
    </span>
    <span className={cn("text-2xl font-bold tabular-nums", valueClassName)}>{value}</span>
    {hint && <span className="text-xs text-muted-foreground dark:text-slate-400">{hint}</span>}
  </div>
);

/** Загружает сводку, если у пользователя есть нужное право */
export const useSummary = <T,>(permission: string, load: () => Promise<T>) => {
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const allowed = !isPermissionsLoading && hasPermission(permission);
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!allowed) return;
    load()
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed]);

  return { data, isLoading, allowed };
};

export const homeCardClass =
  "rounded-2xl shadow-xl relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 transition-colors hover:bg-white/15";
