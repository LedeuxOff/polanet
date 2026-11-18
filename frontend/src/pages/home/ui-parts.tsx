import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/lib/contexts/permission-context";

const iconColors = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300",
  yellow: "bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300",
  green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300",
  cyan: "bg-cyan-100 text-cyan-600 dark:bg-cyan-400/15 dark:text-cyan-300",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300",
} as const;

/** Лёгкий градиент карточки в цвет её иконки */
export const cardTints: Record<keyof typeof iconColors, string> = {
  blue: "bg-gradient-to-bl from-blue-50 via-white to-white dark:from-blue-400/10 dark:via-transparent dark:to-transparent",
  yellow:
    "bg-gradient-to-bl from-amber-50 via-white to-white dark:from-amber-400/10 dark:via-transparent dark:to-transparent",
  green:
    "bg-gradient-to-bl from-emerald-50 via-white to-white dark:from-emerald-400/10 dark:via-transparent dark:to-transparent",
  cyan: "bg-gradient-to-bl from-cyan-50 via-white to-white dark:from-cyan-400/10 dark:via-transparent dark:to-transparent",
  violet:
    "bg-gradient-to-bl from-violet-50 via-white to-white dark:from-violet-400/10 dark:via-transparent dark:to-transparent",
};

export type SectionColor = keyof typeof iconColors;

export const SectionIcon = ({
  color,
  children,
  className,
}: {
  color: SectionColor;
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl [&>svg]:h-5 [&>svg]:w-5",
      iconColors[color],
      className,
    )}
  >
    {children}
  </div>
);

export const SectionHeader = ({
  title,
  description,
  color,
  icon,
}: {
  title: ReactNode;
  description?: ReactNode;
  color: SectionColor;
  icon: ReactNode;
}) => (
  <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
    <div className="flex flex-col gap-1.5">
      <CardTitle className="text-slate-900 dark:text-slate-100">{title}</CardTitle>
      {description && (
        <CardDescription className="text-slate-500 dark:text-slate-300">
          {description}
        </CardDescription>
      )}
    </div>
    <SectionIcon color={color}>{icon}</SectionIcon>
  </CardHeader>
);

export const statTileClass =
  "group/tile relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-3 pl-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-white/15 dark:bg-white/5 dark:hover:border-white/25 dark:hover:bg-white/10";

/** Цвет акцентной полоски плитки */
export const tileAccents: Record<SectionColor, string> = {
  blue: "bg-blue-500 dark:bg-blue-400",
  yellow: "bg-amber-500 dark:bg-amber-400",
  green: "bg-emerald-500 dark:bg-emerald-400",
  cyan: "bg-cyan-500 dark:bg-cyan-400",
  violet: "bg-violet-500 dark:bg-violet-400",
};

/** Вертикальная полоска слева: тонкая, на ховере становится ярче */
export const TileAccent = ({ className }: { className: string }) => (
  <span
    className={cn(
      "absolute bottom-3 left-0 top-3 w-1 rounded-r-full opacity-60 transition-opacity group-hover/tile:opacity-100",
      className,
    )}
  />
);

const SectionColorContext = createContext<SectionColor>("blue");

/** CardContent, задающий цвет акцентов для вложенных плиток */
export const SectionContent = ({
  color,
  children,
}: {
  color: SectionColor;
  children: ReactNode;
}) => (
  <SectionColorContext.Provider value={color}>
    <CardContent>{children}</CardContent>
  </SectionColorContext.Provider>
);

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
}: StatTileProps) => {
  const color = useContext(SectionColorContext);
  return (
    <div className={cn(statTileClass, className)}>
      <TileAccent className={tileAccents[color]} />
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium leading-5 text-slate-500 dark:text-slate-300">
          {label}
        </span>
        {icon && (
          <SectionIcon
            color={color}
            className="h-7 w-7 rounded-lg transition-transform group-hover/tile:scale-110 [&>svg]:h-3.5 [&>svg]:w-3.5"
          >
            {icon}
          </SectionIcon>
        )}
      </div>
      <span
        className={cn(
          "text-3xl font-bold leading-none tracking-tight tabular-nums text-slate-900 dark:text-slate-100",
          valueClassName,
        )}
      >
        {value}
      </span>
      {hint && (
        <span className="text-xs leading-snug text-slate-500 dark:text-slate-400">{hint}</span>
      )}
    </div>
  );
};

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
  "relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-white/20 dark:bg-white/10 dark:shadow-xl dark:backdrop-blur-xl dark:hover:bg-white/15";
