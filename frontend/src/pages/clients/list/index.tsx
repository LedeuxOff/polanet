import { useNavigate } from "@tanstack/react-router";
import { useClientsListPage } from "./hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Client } from "@/lib/types";
import { formatPhoneDisplay } from "@/lib/utils/phone";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { DataTableSearchFilter } from "@/components/data-table/data-table-search-filter";
import { ClientsTypeFilter } from "./ui/clients-type-filter";
import { BottomBar } from "@/components/bottom-bar";

export const ClientsPage = () => {
  const navigate = useNavigate();
  const {
    clients,
    isLoading,
    currentPage,
    limit,
    totalRecords,
    totalPages,
    search,
    clientType,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    handleTypeChange,
    getTypeFilterLabel,
  } = useClientsListPage();
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "name",
      header: "Наименование",
      cell: ({ row }) => {
        const client = row.original;
        const name =
          client.type === "individual"
            ? [client.lastName, client.firstName, client.middleName].filter(Boolean).join(" ") || "—"
            : client.organizationName || "—";

        return <span>{name}</span>;
      },
    },
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ getValue }) => {
        const type = getValue<"individual" | "legal">();
        return type === "individual" ? "Физ. лицо" : "Юр. лицо";
      },
    },
    {
      accessorKey: "phone",
      header: "Телефон",
      cell: ({ getValue }) => formatPhoneDisplay(getValue<string>() || undefined) || "—",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ getValue }) => getValue<string>() || "—",
    },
  ];

  return (
    <PermissionGuard permission="clients:list">
      <div className="flex flex-col gap-4">
        <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
          <CardHeader>
            <CardTitle>Клиенты</CardTitle>
          </CardHeader>
        </Card>

        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <DataTableSearchFilter search={search} handleSearchChange={handleSearchChange} />

          <ClientsTypeFilter
            clientType={clientType}
            handleTypeChange={handleTypeChange}
            getTypeFilterLabel={getTypeFilterLabel}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
        ) : (
          <DataTable
            columns={columns}
            data={clients}
            pagination={{ currentPage, limit, totalRecords, totalPages }}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onRowClick={(row) =>
              navigate({ to: "/clients/$clientId", params: { clientId: row.id.toString() } })
            }
          />
        )}

        <BottomBar
          onCreate={() => {
            if (!hasPermission("clients:create")) {
              showToast("У вас нет прав на создание клиента", "error");
              return;
            }
            navigate({ to: "/clients/new" });
          }}
        />
      </div>
    </PermissionGuard>
  );
};
