import { ColumnDef } from "@tanstack/react-table";
import { useOrdersListPage } from "./hooks";
import { statusLabels } from "./consts";
import { useNavigate, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { HomeIcon, MenuIcon } from "lucide-react";
import { QuickCreateOrderButton } from "./ui/quick-create-order-button";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { OrdersListFilters } from "./ui/filters";

export const OrdersPage = () => {
  const navigate = useNavigate();
  const { orders, isLoading, filters, updateFilter, clearFilters, hasActiveFilters } =
    useOrdersListPage();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();

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
          <span className="text-green-600 font-medium">{receivedAmount} ₽</span>
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
          <span className="text-yellow-600 font-medium">{pendingAmount} ₽</span>
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
          <span className="text-destructive font-medium">{customerDebt} ₽</span>
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
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Заявки</CardTitle>

            <div className="flex items-center gap-2">
              <span className="text-sm text-black">Список заявок</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <OrdersListFilters
            filters={filters}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            updateFilter={updateFilter}
          />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
          ) : (
            <DataTable
              columns={columns}
              data={orders}
              onRowClick={(row) =>
                navigate({
                  to: "/orders/$orderId",
                  params: { orderId: String(row.id) },
                })
              }
            />
          )}
        </CardContent>
      </Card>

      <div
        className={`fixed ${isMobile ? "bottom-2" : "bottom-8"} left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md`}
      >
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Link to="/">
              <Button type="button" className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900">
                <HomeIcon className="w-4 h-4" />
              </Button>
            </Link>

            {isMobile && (
              <Button
                type="button"
                className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
                onClick={() => setOpen(true)}
              >
                <MenuIcon className="w-4 h-4" />
              </Button>
            )}

            <Link to="/orders/new">
              <Button type="button" className="px-8 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900">
                Создать заявку
              </Button>
            </Link>
          </div>

          <QuickCreateOrderButton />
        </div>
      </div>
    </div>
  );
};
