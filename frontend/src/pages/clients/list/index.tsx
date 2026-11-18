import { useNavigate } from "@tanstack/react-router";
import { PAGE_OPTIONS, useClientsListPage } from "./hooks";
import { HeartHandshake } from "lucide-react";
import { ListPageHead, ListPagination } from "@/components/data-list";
import { ClientsTable } from "./ui/clients-table";
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
  } = useClientsListPage();
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();

  return (
    <PermissionGuard permission="clients:list">
      <div className="flex flex-col gap-4">
        <ListPageHead
          icon={<HeartHandshake />}
          iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300"
          title="Клиенты"
          description="Физические и юридические лица"
        />

        {/* Search and filter */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <DataTableSearchFilter
            search={search}
            handleSearchChange={handleSearchChange}
            placeholder="Поиск по имени, телефону или email..."
            inputClassName="h-12 rounded-2xl border-slate-200 bg-white"
          />

          <ClientsTypeFilter clientType={clientType} handleTypeChange={handleTypeChange} />
        </div>

        <ClientsTable
          clients={clients}
          isLoading={isLoading}
          skeletonCount={Math.min(limit, 8)}
          onOpen={(client) =>
            navigate({ to: "/clients/$clientId", params: { clientId: client.id.toString() } })
          }
        />

        <ListPagination
          pageOptions={PAGE_OPTIONS}
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          limit={limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />

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
