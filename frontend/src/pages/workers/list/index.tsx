import { useNavigate } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { BottomBar } from "@/components/bottom-bar";
import { DataTableSearchFilter } from "@/components/data-table/data-table-search-filter";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { Worker, getWorkerName } from "@/lib/types";
import { formatPhoneDisplay } from "@/lib/utils/phone";
import { useWorkersListPage } from "./hooks";

export const WorkersPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();
  const {
    workers,
    isLoading,
    currentPage,
    limit,
    totalRecords,
    totalPages,
    search,
    handleSearchChange,
    handlePageChange,
    handleLimitChange,
  } = useWorkersListPage();

  const columns: ColumnDef<Worker>[] = [
    {
      id: "name",
      header: "ФИО",
      cell: ({ row }) => getWorkerName(row.original),
    },
    {
      accessorKey: "phone",
      header: "Телефон",
      cell: ({ row }) => formatPhoneDisplay(row.original.phone) || "—",
    },
    {
      accessorKey: "teamName",
      header: "Бригада",
      cell: ({ row }) => row.original.teamName || "—",
    },
  ];

  return (
    <PermissionGuard permission="workers:list">
      <div className="flex flex-col gap-4">
        <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
          <CardHeader>
            <CardTitle>Рабочие</CardTitle>
          </CardHeader>
        </Card>

        <DataTableSearchFilter
          search={search}
          handleSearchChange={handleSearchChange}
          placeholder="Поиск по ФИО или телефону"
        />

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
        ) : (
          <DataTable
            columns={columns}
            data={workers}
            pagination={{ currentPage, limit, totalRecords, totalPages }}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onRowClick={(row) =>
              navigate({ to: "/workers/$workerId", params: { workerId: String(row.id) } })
            }
          />
        )}

        <BottomBar
          onCreate={() => {
            if (!hasPermission("workers:create")) {
              showToast("У вас нет прав на создание рабочего", "error");
              return;
            }
            navigate({ to: "/workers/new" });
          }}
        />
      </div>
    </PermissionGuard>
  );
};
