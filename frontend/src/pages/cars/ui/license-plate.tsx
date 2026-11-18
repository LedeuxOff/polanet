import { cn } from "@/lib/utils";

/** Гос. номер в виде номерного знака: «А123ВС 77» → основная часть + регион */
export const LicensePlate = ({
  value,
  size = "md",
  className,
}: {
  value?: string | null;
  size?: "sm" | "md";
  className?: string;
}) => {
  if (!value) return <span className="text-slate-400">—</span>;

  const normalized = value.trim().toUpperCase();
  const match = normalized.replace(/\s+/g, "").match(/^(.*?)(\d{2,3})$/);
  // Регион выделяем, только если номер похож на российский (буква-цифры-буквы-регион)
  const hasRegion = !!match && /^[A-ZА-Я]\d{3}[A-ZА-Я]{2}$/.test(match[1]);
  const main = hasRegion ? match![1] : normalized;
  const region = hasRegion ? match![2] : null;

  return (
    <span
      className={cn(
        "inline-flex w-fit items-stretch overflow-hidden rounded-lg border-2 border-slate-800 bg-white font-mono font-bold uppercase leading-none text-slate-900 dark:border-slate-200",
        size === "sm" ? "text-xs" : "text-sm",
        className,
      )}
    >
      <span
        className={cn(
          "flex items-center tracking-wider",
          size === "sm" ? "px-1.5 py-1" : "px-2 py-1.5",
        )}
      >
        {main}
      </span>
      {region && (
        <span
          className={cn(
            "flex items-center border-l-2 border-slate-800 dark:border-slate-200",
            size === "sm" ? "px-1 text-[10px]" : "px-1.5 text-xs",
          )}
        >
          {region}
        </span>
      )}
    </span>
  );
};
