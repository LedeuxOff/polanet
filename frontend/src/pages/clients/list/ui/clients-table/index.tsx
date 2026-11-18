import { ChevronRightIcon, MailIcon, PhoneIcon } from "lucide-react";
import { useIsMobile } from "@/hooks";
import { Client } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatPhoneDisplay } from "@/lib/utils/phone";
import {
  listCardClass,
  ListEmptyState,
  listTdClass as td,
  listThClass as th,
  Shimmer,
} from "@/components/data-list";
import { ClientAvatar, ClientTypeBadge, getClientName } from "../../../ui/client-identity";

interface Props {
  clients: Client[];
  isLoading: boolean;
  skeletonCount?: number;
  onOpen: (client: Client) => void;
}

const phone = (value: string | null) => formatPhoneDisplay(value || undefined) || "—";
const emptyText = "Попробуйте изменить поиск или тип клиента";

const MobileList = ({ clients, isLoading, skeletonCount = 5, onOpen }: Props) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className={cn(listCardClass, "flex items-center gap-3 p-4")}>
            <Shimmer className="h-11 w-11 rounded-2xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Shimmer className="h-4 w-2/3" />
              <Shimmer className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!clients.length) return <ListEmptyState text={emptyText} />;

  return (
    <div className="flex flex-col gap-3">
      {clients.map((client) => (
        <button
          key={client.id}
          type="button"
          onClick={() => onOpen(client)}
          className={cn(
            listCardClass,
            "flex flex-col gap-3 p-4 text-left transition-all active:scale-[0.99] hover:border-slate-300 dark:hover:bg-white/15",
          )}
        >
          <div className="flex items-center gap-3">
            <ClientAvatar client={client} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
                {getClientName(client)}
              </span>
              <ClientTypeBadge type={client.type} />
            </div>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-500" />
          </div>

          {(client.phone || client.email) && (
            <div className="flex flex-col gap-1.5 rounded-2xl bg-slate-50 p-3 text-sm dark:bg-white/5">
              {client.phone && (
                <span className="flex items-center gap-2 tabular-nums text-slate-600 dark:text-slate-300">
                  <PhoneIcon className="h-4 w-4 shrink-0 text-slate-400" />
                  {phone(client.phone)}
                </span>
              )}
              {client.email && (
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <MailIcon className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">{client.email}</span>
                </span>
              )}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

const DesktopTable = ({ clients, isLoading, skeletonCount = 5, onOpen }: Props) => {
  if (!isLoading && !clients.length) return <ListEmptyState text={emptyText} />;

  return (
    <div className={cn(listCardClass, "overflow-hidden")}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-white/15 dark:bg-white/5">
            <tr>
              <th className={th}>Клиент</th>
              <th className={th}>Тип</th>
              <th className={th}>Телефон</th>
              <th className={th}>Email</th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {isLoading
              ? Array.from({ length: skeletonCount }).map((_, i) => (
                  <tr key={i}>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <Shimmer className="h-9 w-9 rounded-xl" />
                        <Shimmer className="h-4 w-44" />
                      </div>
                    </td>
                    <td className={td}>
                      <Shimmer className="h-6 w-20 rounded-full" />
                    </td>
                    <td className={td}>
                      <Shimmer className="h-4 w-32" />
                    </td>
                    <td className={td}>
                      <Shimmer className="h-4 w-40" />
                    </td>
                    <td />
                  </tr>
                ))
              : clients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => onOpen(client)}
                    className="group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/10"
                  >
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <ClientAvatar client={client} size="sm" />
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {getClientName(client)}
                        </span>
                      </div>
                    </td>
                    <td className={td}>
                      <ClientTypeBadge type={client.type} />
                    </td>
                    <td
                      className={cn(
                        td,
                        "whitespace-nowrap tabular-nums text-slate-600 dark:text-slate-300",
                      )}
                    >
                      {phone(client.phone)}
                    </td>
                    <td className={cn(td, "whitespace-nowrap text-slate-600 dark:text-slate-300")}>
                      {client.email || "—"}
                    </td>
                    <td className="pr-4 text-right">
                      <ChevronRightIcon className="ml-auto h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-300" />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ClientsTable = (props: Props) => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileList {...props} /> : <DesktopTable {...props} />;
};
