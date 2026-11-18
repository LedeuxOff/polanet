import { Breadcrumbs } from "@/components/breadcrumbs";
import { listCardClass } from "@/components/data-list";
import { Order } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CalendarIcon, ClipboardListIcon, MapPinIcon, PackageIcon, UserIcon } from "lucide-react";
import { ReactNode } from "react";
import { typeLabels } from "../../../list/consts";
import { OrderStatusBadge } from "../../../ui/order-status-badge";

interface Props {
  orderId: string;
  order: Order | null;
}

const Chip = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <span className="flex min-w-0 max-w-full items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0 [&>svg]:text-slate-400">
    {icon}
    <span className="truncate">{children}</span>
  </span>
);

export const OrderHeader = ({ orderId, order }: Props) => {
  const payer = order ? [order.payerLastName, order.payerFirstName].filter(Boolean).join(" ") : "";
  const created = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className={cn(listCardClass, "flex flex-col gap-5 p-5 sm:p-6")}>
      <Breadcrumbs
        items={[
          { label: "Заявки", active: false, href: "/orders" },
          { label: `Заявка № ${orderId}`, active: true },
        ]}
      />

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300">
          <ClipboardListIcon className="h-7 w-7" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
              Заявка № {orderId}
            </h1>
            {order?.status && <OrderStatusBadge status={order.status} />}
          </div>
          <div className="hidden flex-wrap items-center gap-2 sm:flex">
            {order?.type && (
              <Chip icon={<PackageIcon />}>{typeLabels[order.type] || order.type}</Chip>
            )}
            {payer && <Chip icon={<UserIcon />}>{payer}</Chip>}
            {order?.address && <Chip icon={<MapPinIcon />}>{order.address}</Chip>}
            {created && <Chip icon={<CalendarIcon />}>Создана {created}</Chip>}
          </div>
        </div>
      </div>
    </div>
  );
};
