import { useNavigate } from "@tanstack/react-router";
import { useTransportCardsListPage } from "./hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { DataTableSearchFilter } from "@/components/data-table/data-table-search-filter";
import { BottomBar } from "@/components/bottom-bar";

const getStatusBadge = (status: string) => {
  if (status === "active") {
    return (
      <Badge className="bg-green-200 text-green-700 border border-green-300 dark:bg-green-200 dark:text-green-700">
        Активна
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-red-200 text-red-700 border border-red-300">
      Неактивна
    </Badge>
  );
};

export const TransportCardsPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();

  const {
    cards,
    isLoading,
    currentPage,
    limit,
    totalRecords,
    totalPages,
    search,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
  } = useTransportCardsListPage();

  const columns: ColumnDef<(typeof cards)[0]>[] = [
    {
      accessorKey: "cardNumber",
      header: "Номер карты",
      cell: ({ row }) => <span>{row.getValue("cardNumber")}</span>,
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "totalExpenses",
      header: "Общие расходы",
      cell: ({ getValue }) => `${getValue<number>()} ₽`,
    },
  ];

  return (
    <PermissionGuard permission="transport-cards:list">
      <div className="flex flex-col gap-4">
        <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
          <CardHeader>
            <CardTitle>Транспортные карты</CardTitle>
          </CardHeader>
        </Card>

        {/* Search */}
        <DataTableSearchFilter search={search} handleSearchChange={handleSearchChange} />

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
        ) : (
          <DataTable
            columns={columns}
            data={cards}
            pagination={{ currentPage, limit, totalRecords, totalPages }}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onRowClick={(row) =>
              navigate({
                to: "/transport-cards/$cardId",
                params: { cardId: row.id.toString() },
              })
            }
          />
        )}

        <BottomBar
          onCreate={() => {
            if (!hasPermission("transport-cards:create")) {
              showToast("У вас нет прав на создание карты", "error");
              return;
            }
            navigate({ to: "/transport-cards/new" });
          }}
        />
      </div>
    </PermissionGuard>
  );
};
