import { ChevronRightIcon, PhoneIcon } from "lucide-react";
import { useIsMobile } from "@/hooks";
import type { ScreedClient } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatPhoneDisplay } from "@/lib/utils/phone";
import {
  listCardClass,
  ListEmptyState,
  listTdClass as td,
  listThClass as th,
  Shimmer,
} from "@/components/data-list";
import { getScreedClientName } from "../../shared";
import { ScreedClientAvatar, WorksCountBadge } from "../../ui/screed-client-identity";

interface Props {
  clients: ScreedClient[];
  isLoading: boolean;
  skeletonCount?: number;
  onOpen: (client: ScreedClient) => void;
}

const emptyText = "Попробуйте изменить имя или телефон";

const MobileList = ({ clients, isLoading, skeletonCount = 5, onOpen }: Props) => {
  if (isLoading && !clients.length) {
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
    <div className={cn("flex flex-col gap-3 transition-opacity", isLoading && "opacity-60")}>
      {clients.map((client) => (
        <button
          key={client.id}
          type="button"
          onClick={() => onOpen(client)}
          className={cn(
            listCardClass,
            "flex items-center gap-3 p-4 text-left transition-all active:scale-[0.99] hover:border-slate-300 dark:hover:bg-white/15",
          )}
        >
          <ScreedClientAvatar client={client} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
              {getScreedClientName(client)}
            </span>
            <span className="flex items-center gap-1.5 text-xs tabular-nums text-slate-500 dark:text-slate-400">
              <PhoneIcon className="h-3.5 w-3.5" />
              {formatPhoneDisplay(client.phone) || "Без телефона"}
            </span>
          </div>
          <WorksCountBadge count={client.worksCount} />
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-500" />
        </button>
      ))}
    </div>
  );
};

const DesktopTable = ({ clients, isLoading, skeletonCount = 5, onOpen }: Props) => {
  if (!isLoading && !clients.length) return <ListEmptyState text={emptyText} />;
  const showSkeleton = isLoading && !clients.length;

  return (
    <div
      className={cn(
        listCardClass,
        "overflow-hidden transition-opacity",
        isLoading && clients.length > 0 && "opacity-60",
      )}
    >
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-white/15 dark:bg-white/5">
            <tr>
              <th className={th}>Клиент</th>
              <th className={th}>Телефон</th>
              <th className={th}>Работы</th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {showSkeleton
              ? Array.from({ length: skeletonCount }).map((_, i) => (
                  <tr key={i}>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <Shimmer className="h-9 w-9 rounded-xl" />
                        <Shimmer className="h-4 w-44" />
                      </div>
                    </td>
                    <td className={td}>
                      <Shimmer className="h-4 w-32" />
                    </td>
                    <td className={td}>
                      <Shimmer className="h-6 w-20 rounded-full" />
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
                        <ScreedClientAvatar client={client} size="sm" />
                        <div className="flex min-w-0 flex-col">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {getScreedClientName(client)}
                          </span>
                          {client.notes && (
                            <span
                              className="max-w-[320px] truncate text-xs text-slate-500 dark:text-slate-400"
                              title={client.notes}
                            >
                              {client.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td
                      className={cn(
                        td,
                        "whitespace-nowrap tabular-nums text-slate-600 dark:text-slate-300",
                      )}
                    >
                      {formatPhoneDisplay(client.phone) || "—"}
                    </td>
                    <td className={td}>
                      <WorksCountBadge count={client.worksCount} />
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

export const ScreedClientsTable = (props: Props) => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileList {...props} /> : <DesktopTable {...props} />;
};
