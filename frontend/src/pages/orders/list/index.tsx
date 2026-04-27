import { ColumnDef } from "@tanstack/react-table";
import { useOrdersListPage } from "./hooks";
import { typeLabels } from "../detail/consts";
import { statusLabels } from "./consts";
import { useNavigate, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HomeIcon, TrashIcon, XIcon } from "lucide-react";
import { QuickCreateOrderButton } from "./ui/quick-create-order-button";

export const OrdersPage = () => {
  const navigate = useNavigate();
  const { orders, isLoading, filters, updateFilter, clearFilters, hasActiveFilters } =
    useOrdersListPage();

  const columns: ColumnDef<(typeof orders)[0]>[] = [
    {
      accessorKey: "id",
      header: "№",
      cell: ({ getValue }) => `#${getValue<number>()}`,
    },
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ getValue }) => typeLabels[getValue<string>()] || getValue<string>(),
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Заявки</CardTitle>
          </div>
          <div className="flex gap-2 items-end">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 flex-1">
              {/* Поиск по номеру */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Поиск по №</label>
                <Input
                  type="number"
                  placeholder="Введите номер"
                  value={filters.id}
                  onChange={(e) => updateFilter("id", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                />
              </div>

              {/* Фильтр по статусу */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Статус</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => updateFilter("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Фильтр по долгу клиента */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Долг клиента</label>
                <Select
                  value={filters.customerDebt}
                  onValueChange={(value) => updateFilter("customerDebt", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="has">Есть долг</SelectItem>
                    <SelectItem value="none">Нет долга</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Фильтр по долгу компании */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Долг компании</label>
                <Select
                  value={filters.companyDebt}
                  onValueChange={(value) => updateFilter("companyDebt", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="has">Есть долг</SelectItem>
                    <SelectItem value="none">Нет долга</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Фильтр по дате от */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Дата от</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter("dateFrom", e.target.value)}
                />
              </div>

              {/* Фильтр по дату */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Дата до</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter("dateTo", e.target.value)}
                />
              </div>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex justify-center items-center py-5 bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 border-0"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
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

      <div className="fixed bottom-8 left-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md">
        <Link to="/">
          <Button type="button" className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900">
            <HomeIcon className="w-4 h-4" />
          </Button>
        </Link>

        <QuickCreateOrderButton />
      </div>
    </>
  );
};
