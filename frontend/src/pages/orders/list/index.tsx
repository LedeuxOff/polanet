import { ColumnDef } from "@tanstack/react-table";
import { useOrdersListPage } from "./hooks";
import { statusLabels } from "./consts";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { OrdersListFilters } from "./ui/filters";
import { BottomBar } from "@/components/bottom-bar";

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
      header: "№ заявки",
      cell: ({ getValue }) => `№ ${getValue<number>()}`,
    },
    {
      accessorKey: "clientName",
      header: "Клиент",
      cell: ({ getValue }) => {
        const clientName = getValue<string | null>();
        return clientName ? (
          <span className="font-medium">{clientName}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "address",
      header: "Адрес",
      cell: ({ row }) => row.getValue("address"),
    },

    {
      accessorKey: "receivedAmount",
      header: "Получено",
      cell: ({ row }) => {
        const receivedAmount = row.original.receivedAmount ?? 0;
        return receivedAmount > 0 ? (
          <span className="text-green-600 dark:text-green-300 font-medium">{receivedAmount} ₽</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "pendingAmount",
      header: "В ожидании",
      cell: ({ row }) => {
        const pendingAmount = row.original.pendingAmount ?? 0;
        return pendingAmount > 0 ? (
          <span className="text-yellow-600 dark:text-yellow-300 font-medium">
            {pendingAmount} ₽
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "customerDebt",
      header: "Долг клиента",
      cell: ({ row }) => {
        const customerDebt = row.original.customerDebt ?? 0;
        return customerDebt > 0 ? (
          <span className="text-destructive dark:text-red-200 font-medium">{customerDebt} ₽</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "companyDebt",
      header: "Долг компании",
      cell: ({ row }) => {
        const companyDebt = row.original.companyDebt ?? 0;
        return companyDebt > 0 ? (
          <span className="text-destructive font-medium">{companyDebt} ₽</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ getValue }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {statusLabels[getValue<string>()] || getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Дата создания",
      cell: ({ getValue }) => {
        const date = new Date(getValue<string>());
        return date.toLocaleString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4 pb-32">
      <Card className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Заявки</CardTitle>
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
