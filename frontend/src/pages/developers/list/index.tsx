import { useNavigate } from "@tanstack/react-router";
import { Code2Icon } from "lucide-react";
import { BottomBar } from "@/components/bottom-bar";
import { DataTableSearchFilter } from "@/components/data-table/data-table-search-filter";
import { listFilterControlClass, ListPageHead, ListPagination } from "@/components/data-list";
import { usePermissions } from "@/lib/contexts/permission-context";
import { UsersTable } from "@/pages/users/list/ui/users-table";
import { PAGE_OPTIONS, useDevelopersList } from "./hooks";

const COLUMNS = { email: true, phone: true, roleName: false };

export const DevelopersPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const {
    developers,
    isLoading,
    currentPage,
    limit,
    totalRecords,
    totalPages,
    search,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
  } = useDevelopersList();
  const canCreate = hasPermission("users:create");

  return (
    <div className="flex flex-col gap-4">
      <ListPageHead
        icon={<Code2Icon />}
        iconClassName="bg-slate-900 text-white dark:bg-white dark:text-slate-900"
        title="Разработчики"
        description="Учётные записи с полным доступом к системе"
      />

      <DataTableSearchFilter
        search={search}
        handleSearchChange={handleSearchChange}
        placeholder="Поиск по ФИО, email или телефону..."
        inputClassName={listFilterControlClass}
      />

      <UsersTable
        users={developers}
        isLoading={isLoading}
        columnVisibility={COLUMNS}
        skeletonCount={Math.min(limit, 6)}
        onOpen={(u) =>
          navigate({ to: "/developers/$developerId", params: { developerId: u.id.toString() } })
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
        hideSaveButton={!canCreate}
        onCreate={canCreate ? () => navigate({ to: "/developers/new" }) : undefined}
      />
    </div>
  );
};
