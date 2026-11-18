import type { ScreedClient } from "@/lib/types";
import { cn } from "@/lib/utils";

export const screedTone = "bg-teal-100 text-teal-700 dark:bg-teal-400/20 dark:text-teal-200";

const sizes = {
  sm: "h-9 w-9 rounded-xl text-xs",
  md: "h-11 w-11 rounded-2xl text-sm",
} as const;

export const ScreedClientAvatar = ({
  client,
  size = "md",
}: {
  client: Pick<ScreedClient, "lastName" | "firstName">;
  size?: keyof typeof sizes;
}) => (
  <div
    className={cn(
      "flex shrink-0 items-center justify-center font-semibold",
      sizes[size],
      screedTone,
    )}
  >
    {`${client.lastName?.[0] ?? ""}${client.firstName?.[0] ?? ""}`.toUpperCase() || "?"}
  </div>
);

const plural = (n: number, forms: [string, string, string]) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return forms[1];
  return forms[2];
};

export const worksLabel = (n: number) => `${n} ${plural(n, ["работа", "работы", "работ"])}`;

export const WorksCountBadge = ({ count }: { count: number }) => (
  <span
    className={cn(
      "inline-flex w-fit items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium tabular-nums",
      count > 0
        ? "bg-teal-100 text-teal-700 dark:bg-teal-400/20 dark:text-teal-200"
        : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400",
    )}
  >
    {count > 0 ? worksLabel(count) : "Нет работ"}
  </span>
);
