import { Building2Icon } from "lucide-react";
import { Client } from "@/lib/types";
import { cn } from "@/lib/utils";

type ClientLike = Pick<
  Client,
  "type" | "lastName" | "firstName" | "middleName" | "organizationName"
>;

export const getClientName = (client: ClientLike) =>
  client.type === "individual"
    ? [client.lastName, client.firstName, client.middleName].filter(Boolean).join(" ") || "—"
    : client.organizationName || "—";

export const clientTypeLabels = {
  individual: "Физ. лицо",
  legal: "Юр. лицо",
} as const;

const tones = {
  individual: "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200",
  legal: "bg-indigo-100 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-200",
} as const;

const sizes = {
  sm: "h-9 w-9 rounded-xl text-xs [&>svg]:h-4 [&>svg]:w-4",
  md: "h-11 w-11 rounded-2xl text-sm [&>svg]:h-5 [&>svg]:w-5",
} as const;

/** Аватар клиента: инициалы для физ. лица, здание для юр. лица */
export const ClientAvatar = ({
  client,
  size = "md",
}: {
  client: ClientLike;
  size?: keyof typeof sizes;
}) => (
  <div
    className={cn(
      "flex shrink-0 items-center justify-center font-semibold",
      sizes[size],
      tones[client.type] ?? tones.individual,
    )}
  >
    {client.type === "legal" ? (
      <Building2Icon />
    ) : (
      `${client.lastName?.[0] ?? ""}${client.firstName?.[0] ?? ""}`.toUpperCase() || "?"
    )}
  </div>
);

export const ClientTypeBadge = ({ type }: { type: Client["type"] }) => (
  <span
    className={cn(
      "inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
      tones[type] ?? tones.individual,
    )}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
    {clientTypeLabels[type] ?? type}
  </span>
);
