import { ColumnDef } from "@tanstack/react-table";
import { useOrdersListPage } from "./hooks";
import { statusLabels, typeLabels } from "./consts";
import { cn, getFormattedAmount } from "@/lib/utils";
import { ClipboardListIcon, MapPinIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { OrdersListFilters } from "./ui/filters";
import { BottomBar } from "@/components/bottom-bar";

const statusStyles: Record<string, { badge: string; dot: string }> = {
  draft: {
    badge: "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200",
    dot: "bg-zinc-400",
  },
  new: {
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
    dot: "bg-sky-500",
  },
  in_progress: {
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
    dot: "bg-blue-500 animate-pulse",
  },
  completed: {
    badge: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200",
    dot: "bg-green-500",
  },
  cancelled: {
    badge: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200",
    dot: "bg-red-500",
  },
  archived: {
    badge: "bg-stone-100 text-stone-600 dark:bg-white/5 dark:text-zinc-400",
    dot: "bg-stone-400",
  },
};

const EmptyValue = () => <span className="text-muted-foreground">—</span>;

const AmountValue = ({ value, className }: { value?: number; className: string }) =>
  value && value > 0 ? (
    <span className={cn("font-medium tabular-nums", className)}>{getFormattedAmount(value)} ₽</span>
  ) : (
    <EmptyValue />
  );

const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 11) return phone;
  return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
};

export const OrdersPage = () => {
  const navigate = useNavigate();
  const {
    orders,
    isLoading,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    currentPage,
    limit,
    totalRecords,
    totalPages,
    handlePageChange,
    handleLimitChange,
  } = useOrdersListPage();

  const columns: ColumnDef<(typeof orders)[0]>[] = [
    {
      accessorKey: "id",
      header: "Заявка",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold">№ {row.original.id}</span>
          <span className="text-xs text-muted-foreground">
            {typeLabels[row.original.type] || row.original.type}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "clientName",
      header: "Клиент",
      cell: ({ row }) => {
        const { clientName, payerPhone } = row.original;
        if (!clientName) return <EmptyValue />;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{clientName}</span>
            {payerPhone && (
              <span className="text-xs text-muted-foreground">{formatPhone(payerPhone)}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "address",
      header: "Адрес",
      cell: ({ row }) => {
        const { address, volume } = row.original;
        if (!address) return <EmptyValue />;
        return (
          <div className="flex items-start gap-2">
            <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex min-w-0 flex-col">
              <span className="max-w-[260px] truncate" title={address}>
                {address}
              </span>
              {volume ? <span className="text-xs text-muted-foreground">{volume} м³</span> : null}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "receivedAmount",
      header: "Получено",
      cell: ({ row }) => (
        <AmountValue
          value={row.original.receivedAmount}
          className="text-green-600 dark:text-green-300"
        />
      ),
    },
    {
      accessorKey: "pendingAmount",
      header: "В ожидании",
      cell: ({ row }) => (
        <AmountValue
          value={row.original.pendingAmount}
          className="text-amber-600 dark:text-amber-300"
        />
      ),
    },
    {
      accessorKey: "customerDebt",
      header: "Долг клиента",
      cell: ({ row }) => (
        <AmountValue value={row.original.customerDebt} className="text-red-600 dark:text-red-300" />
      ),
    },
    {
      accessorKey: "companyDebt",
      header: "Долг компании",
      cell: ({ row }) => (
        <AmountValue value={row.original.companyDebt} className="text-red-600 dark:text-red-300" />
      ),
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ getValue }) => {
        const status = getValue<string>();
        const styles = statusStyles[status] ?? statusStyles.draft;
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
              styles.badge,
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
            {statusLabels[status] || status}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Создана",
      cell: ({ getValue }) => {
        const date = new Date(getValue<string>());
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {date.toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="text-xs text-muted-foreground">
              {date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4 pb-32">
      <Card className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
                <ClipboardListIcon className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle>Заявки</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {isLoading ? "Загрузка..." : `Всего: ${totalRecords}`}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <OrdersListFilters
        filters={filters}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        updateFilter={updateFilter}
      />

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          pagination={{ currentPage, limit, totalRecords, totalPages }}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onRowClick={(row) =>
            navigate({
              to: "/orders/$orderId",
              params: { orderId: String(row.id) },
            })
          }
        />
      )}

      <BottomBar
        onCreate={() => {
          navigate({ to: "/orders/new" });
        }}
        quickCreate
      />
    </div>
  );
};
