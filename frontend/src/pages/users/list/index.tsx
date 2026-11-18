import { useNavigate } from "@tanstack/react-router";
import { useUsersList } from "./hooks";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { useState } from "react";
import { DataTableColumnSetting } from "@/components/data-table/data-table-column-setting";
import { DataTableSearchFilter } from "@/components/data-table/data-table-search-filter";
import { UsersPageRoleFilter } from "./ui/role-filter";
import { BottomBar } from "@/components/bottom-bar";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { UsersListPageHead } from "./ui/users-list-head";
import { UsersTable } from "./ui/users-table";
import { UsersPagination } from "./ui/users-pagination";

export const UsersPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();

  const {
    users,
    isLoading,
    currentPage,
    limit,
    totalRecords,
    totalPages,
    search,
    roleCode,
    roles,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    handleRoleChange,
  } = useUsersList();

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    email: true,
    phone: true,
    roleName: true,
  });

  const columnDefinitions: Array<{ key: string; label: string }> = [
    { key: "email", label: "Email" },
    { key: "phone", label: "Телефон" },
    { key: "roleName", label: "Роль" },
  ];

  const handleColumnToggle = (key: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <PermissionGuard permission="users:list">
      <div className="flex flex-col gap-4">
        <UsersListPageHead />

        {/* Фильтры */}
        <div className="grid grid-cols-[auto_1fr] gap-3 sm:flex">
          {/* Кнопка настроек колонок */}
          <DataTableColumnSetting
            columnDefinitions={columnDefinitions}
            columnVisibility={columnVisibility}
            handleColumnToggle={handleColumnToggle}
            triggerClassName="h-11 w-11 rounded-2xl border-slate-200 bg-white"
          />

          {/* Поиск */}
          <DataTableSearchFilter
            search={search}
            handleSearchChange={handleSearchChange}
            placeholder="Поиск по ФИО, email или телефону..."
            inputClassName="h-11 rounded-2xl border-slate-200 bg-white"
          />

          {/* Фильтр по роли */}
          <div className="col-span-2 sm:col-auto [&>button]:w-full sm:[&>button]:w-auto">
            <UsersPageRoleFilter
              roleCode={roleCode}
              roles={roles}
              handleRoleChange={handleRoleChange}
            />
          </div>
        </div>

        <UsersTable
          users={users}
          isLoading={isLoading}
          columnVisibility={columnVisibility}
          skeletonCount={Math.min(limit, 8)}
          onOpen={(user) =>
            navigate({ to: "/users/$userId", params: { userId: user.id.toString() } })
          }
        />

        <UsersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          limit={limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />

        <BottomBar
          onCreate={() => {
            if (!hasPermission("users:create")) {
              showToast("У вас нет прав на создание пользователя", "error");
              return;
            }
            navigate({ to: "/users/new" });
          }}
        />
      </div>
    </PermissionGuard>
  );
};
