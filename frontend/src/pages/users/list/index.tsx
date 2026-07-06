import { DataTable } from "@/components/ui/table";
import { User } from "@/lib/types";
import { formatPhoneDisplay } from "@/lib/utils/phone";
import { useNavigate } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { useUsersList } from "./hooks";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { useState } from "react";
import { DataTableColumnSetting } from "@/components/data-table-column-setting";
import { DataTableSearchFilter } from "@/components/data-table-search-filter";
import { UsersPageRoleFilter } from "./ui/role-filter";
import { BottomBar } from "@/components/bottom-bar";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { UsersListPageHead } from "./ui/users-list-head";

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

  const [showColumnSettings, setShowColumnSettings] = useState(false);

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    fullName: true,
    email: true,
    phone: true,
    roleName: true,
  });

  const columnDefinitions: Array<{ key: string; label: string }> = [
    { key: "fullName", label: "ФИО" },
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

  // Base column definitions
  const baseColumns: ColumnDef<User>[] = [
    {
      accessorKey: "fullName",
      header: "ФИО",
      cell: ({ row }) => {
        const lastName = row.original.lastName;
        const firstName = row.original.firstName;
        const middleName = row.original.middleName;

        const initials = [firstName?.charAt(0), middleName?.charAt(0)].filter(Boolean).join(".");

        const fullName = initials ? `${lastName} ${initials}.` : lastName;

        return fullName;
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Телефон",
      cell: ({ getValue }) => formatPhoneDisplay(getValue<string>() || undefined) || "—",
    },
    {
      accessorKey: "roleName",
      header: "Роль",
      cell: ({ getValue }) => getValue<string>() || "—",
    },
  ];

  // Filter columns based on visibility
  const columns: ColumnDef<User>[] = baseColumns.filter((col) => {
    // Type guard to check if column has accessorKey
    const colWithAccessor = col as { accessorKey?: string };
    const key = colWithAccessor.accessorKey;
    if (!key) return true;
    return columnVisibility[key] !== false;
  });

  return (
    <PermissionGuard permission="users:list">
      <div className="flex flex-col gap-4">
        <UsersListPageHead />

        {/* Фильтры */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Кнопка настроек колонок */}
          <DataTableColumnSetting
            columnDefinitions={columnDefinitions}
            columnVisibility={columnVisibility}
            handleColumnToggle={handleColumnToggle}
            showColumnSettings={showColumnSettings}
            setShowColumnSettings={setShowColumnSettings}
          />

          {/* Поиск */}
          <DataTableSearchFilter search={search} handleSearchChange={handleSearchChange} />

          {/* Фильтр по роли */}
          <UsersPageRoleFilter
            roleCode={roleCode}
            roles={roles}
            handleRoleChange={handleRoleChange}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            onRowClick={(row) =>
              navigate({ to: "/users/$userId", params: { userId: row.id.toString() } })
            }
            pagination={{
              currentPage,
              totalPages,
              totalRecords,
              limit,
            }}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        )}

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
