import { HardHatIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const teamTone = (isActive: boolean) =>
  isActive
    ? "bg-sky-100 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300"
    : "bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-400";

export const TeamIcon = ({ isActive, className }: { isActive: boolean; className?: string }) => (
  <div
    className={cn(
      "flex shrink-0 items-center justify-center [&>svg]:h-1/2 [&>svg]:w-1/2",
      teamTone(isActive),
      className,
    )}
  >
    <HardHatIcon />
  </div>
);

export const TeamCalendarBadge = ({ isActive }: { isActive: boolean }) => (
  <span
    className={cn(
      "inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
      isActive
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200"
        : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
    )}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {isActive ? "В календаре" : "Скрыта"}
  </span>
);

const plural = (n: number, forms: [string, string, string]) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return forms[1];
  return forms[2];
};

export const membersLabel = (n: number) =>
  `${n} ${plural(n, ["участник", "участника", "участников"])}`;
