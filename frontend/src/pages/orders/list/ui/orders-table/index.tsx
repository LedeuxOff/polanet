import { ChevronRightIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { useIsMobile } from "@/hooks";
import { Order } from "@/lib/types";
import { cn, getFormattedAmount } from "@/lib/utils";
import {
  listCardClass,
  ListEmptyState,
  listTdClass as td,
  listThClass as th,
  Shimmer,
} from "@/components/data-list";
import { typeLabels } from "../../consts";
import { OrderStatusBadge as StatusBadge } from "../../../ui/order-status-badge";

export type OrderRow = Order & {
  clientName?: string | null;
  receivedAmount?: number;
  pendingAmount?: number;
  customerDebt?: number;
  companyDebt?: number;
};

interface Props {
  orders: OrderRow[];
  isLoading: boolean;
  skeletonCount?: number;
  onOpen: (order: OrderRow) => void;
}

const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 11) return phone;
  return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

const Empty = () => <span className="text-slate-400 dark:text-slate-500">—</span>;

const amounts = [
  { key: "receivedAmount", label: "Получено", tone: "text-green-600 dark:text-green-300" },
  { key: "pendingAmount", label: "В ожидании", tone: "text-amber-600 dark:text-amber-300" },
  { key: "customerDebt", label: "Долг клиента", tone: "text-red-600 dark:text-red-300" },
  { key: "companyDebt", label: "Долг компании", tone: "text-red-600 dark:text-red-300" },
] as const;

const Amount = ({ value, tone }: { value?: number; tone: string }) =>
  value && value > 0 ? (
    <span className={cn("whitespace-nowrap font-medium tabular-nums", tone)}>
      {getFormattedAmount(value)} ₽
    </span>
  ) : (
    <Empty />
  );

/* ---------- Мобильная версия: карточки ---------- */

const MobileList = ({ orders, isLoading, skeletonCount = 5, onOpen }: Props) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className={cn(listCardClass, "flex flex-col gap-3 p-4")}>
            <div className="flex justify-between">
              <Shimmer className="h-5 w-24" />
              <Shimmer className="h-6 w-20 rounded-full" />
            </div>
            <Shimmer className="h-4 w-2/3" />
            <Shimmer className="h-12 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  if (!orders.length) return <ListEmptyState text="Попробуйте изменить номер, статус или даты" />;

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => {
        const money = amounts.filter((a) => (order[a.key] ?? 0) > 0);
        return (
          <button
            key={order.id}
            type="button"
            onClick={() => onOpen(order)}
            className={cn(
              listCardClass,
              "flex flex-col gap-3 p-4 text-left transition-all active:scale-[0.99] hover:border-slate-300 dark:hover:bg-white/15",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  № {order.id}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {typeLabels[order.type] || order.type} · {formatDate(order.createdAt)},{" "}
                  {formatTime(order.createdAt)}
                </span>
              </div>
              <StatusBadge status={order.status} />
            </div>

            {(order.clientName || order.payerPhone) && (
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-medium text-slate-900 dark:text-slate-100">
                  {order.clientName || "—"}
                </span>
                {order.payerPhone && (
                  <span className="flex shrink-0 items-center gap-1.5 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                    <PhoneIcon className="h-3.5 w-3.5" />
                    {formatPhone(order.payerPhone)}
                  </span>
                )}
              </div>
            )}

            {order.address && (
              <div className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-sm dark:bg-white/5">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span className="line-clamp-2 flex-1 text-slate-600 dark:text-slate-300">
                  {order.address}
                </span>
                {order.volume ? (
                  <span className="shrink-0 rounded-lg bg-white px-2 py-0.5 text-xs font-medium tabular-nums text-slate-700 dark:bg-white/10 dark:text-slate-200">
                    {order.volume} м³
                  </span>
                ) : null}
              </div>
            )}

            {money.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {money.map((a) => (
                  <div
                    key={a.key}
                    className="flex flex-col gap-0.5 rounded-2xl border border-slate-200 px-3 py-2 dark:border-white/15"
                  >
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {a.label}
                    </span>
                    <Amount value={order[a.key]} tone={a.tone} />
                  </div>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

/* ---------- Десктоп: таблица ---------- */

const DesktopTable = ({ orders, isLoading, skeletonCount = 5, onOpen }: Props) => {
  if (!isLoading && !orders.length)
    return <ListEmptyState text="Попробуйте изменить номер, статус или даты" />;

  return (
    <div className={cn(listCardClass, "overflow-hidden")}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-white/15 dark:bg-white/5">
            <tr>
              <th className={th}>Заявка</th>
              <th className={th}>Клиент</th>
              <th className={th}>Адрес</th>
              {amounts.map((a) => (
                <th key={a.key} className={cn(th, "text-right")}>
                  {a.label}
                </th>
              ))}
              <th className={th}>Статус</th>
              <th className={th}>Создана</th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {isLoading
              ? Array.from({ length: skeletonCount }).map((_, i) => (
                  <tr key={i}>
                    <td className={td}>
                      <Shimmer className="h-4 w-16" />
                    </td>
                    <td className={td}>
                      <Shimmer className="h-4 w-36" />
                    </td>
                    <td className={td}>
                      <Shimmer className="h-4 w-48" />
                    </td>
                    {amounts.map((a) => (
                      <td key={a.key} className={td}>
                        <Shimmer className="ml-auto h-4 w-16" />
                      </td>
                    ))}
                    <td className={td}>
                      <Shimmer className="h-6 w-24 rounded-full" />
                    </td>
                    <td className={td}>
                      <Shimmer className="h-4 w-20" />
                    </td>
                    <td />
                  </tr>
                ))
              : orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => onOpen(order)}
                    className="group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/10"
                  >
                    <td className={td}>
                      <div className="flex flex-col">
                        <span className="whitespace-nowrap font-semibold text-slate-900 dark:text-slate-100">
                          № {order.id}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {typeLabels[order.type] || order.type}
                        </span>
                      </div>
                    </td>
                    <td className={td}>
                      {order.clientName ? (
                        <div className="flex flex-col">
                          <span className="whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                            {order.clientName}
                          </span>
                          {order.payerPhone && (
                            <span className="whitespace-nowrap text-xs tabular-nums text-slate-500 dark:text-slate-400">
                              {formatPhone(order.payerPhone)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Empty />
                      )}
                    </td>
                    <td className={td}>
                      {order.address ? (
                        <div className="flex items-start gap-2">
                          <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                          <div className="flex min-w-0 flex-col">
                            <span
                              className="max-w-[240px] truncate text-slate-700 dark:text-slate-200"
                              title={order.address}
                            >
                              {order.address}
                            </span>
                            {order.volume ? (
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {order.volume} м³
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <Empty />
                      )}
                    </td>
                    {amounts.map((a) => (
                      <td key={a.key} className={cn(td, "text-right")}>
                        <Amount value={order[a.key]} tone={a.tone} />
                      </td>
                    ))}
                    <td className={td}>
                      <StatusBadge status={order.status} />
                    </td>
                    <td className={td}>
                      <div className="flex flex-col">
                        <span className="whitespace-nowrap font-medium text-slate-700 dark:text-slate-200">
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatTime(order.createdAt)}
                        </span>
                      </div>
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

export const OrdersTable = (props: Props) => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileList {...props} /> : <DesktopTable {...props} />;
};
