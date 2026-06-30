import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { User, Role } from "@/lib/types";
import { Link, useNavigate } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { useUsersList } from "./hooks";
import { HomeIcon, MenuIcon, SearchIcon, ChevronDownIcon } from "lucide-react";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";

export const UsersPage = () => {
  const navigate = useNavigate();
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
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();
  const [showRolePopover, setShowRolePopover] = useState(false);

  const columns: ColumnDef<User>[] = [
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
      cell: ({ getValue }) => getValue<string>() || "—",
    },
    {
      accessorKey: "roleName",
      header: "Роль",
      cell: ({ getValue }) => getValue<string>() || "—",
    },
  ];

  const getRoleName = (roleId: string | null): string => {
    const role = roles.find((r) => r.id.toString() === roleId);
    return role?.name || "—";
  };

  const getRoleFilterLabel = (): string => {
    if (roleCode === "all") return "Все роли";
    const role = roles.find((r) => r.id.toString() === roleCode);
    return role?.name || "Все роли";
  };

  return (
    <PermissionGuard permission="users:list">
      <div className="flex flex-col gap-4">
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <div className="flex flex-col gap-2">
              <CardTitle>Пользователи</CardTitle>
            </div>
          </CardHeader>
        </Card>

        {/* Фильтры */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Поиск */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Поиск по ФИО, email или телефону..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>

          {/* Фильтр по роли */}
          <Popover.Root open={showRolePopover} onOpenChange={setShowRolePopover}>
            <Popover.Trigger asChild>
              <Button
                variant="outline"
                className="rounded-xl flex items-center gap-2 min-w-[180px]"
              >
                <span className="truncate">{getRoleFilterLabel()}</span>
                <ChevronDownIcon className="h-4 w-4 ml-auto shrink-0" />
              </Button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="z-50 w-64 rounded-xl bg-white border border-gray-200 shadow-lg p-1"
                sideOffset={5}
                align="end"
              >
                <div className="flex flex-col">
                  {/* Все роли */}
                  <button
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      roleCode === "all"
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => {
                      handleRoleChange("all");
                      setShowRolePopover(false);
                    }}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        roleCode === "all" ? "border-blue-600 bg-blue-600" : "border-gray-300"
                      }`}
                    >
                      {roleCode === "all" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                    Все роли
                  </button>

                  {/* Разделитель */}
                  <div className="my-1 h-px bg-gray-100" />

                  {/* Роли */}
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                        roleCode === role.id.toString()
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => {
                        handleRoleChange(role.id.toString());
                        setShowRolePopover(false);
                      }}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          roleCode === role.id.toString()
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-300"
                        }`}
                      >
                        {roleCode === role.id.toString() && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      {role.name}
                    </button>
                  ))}
                </div>
                <Popover.Arrow className="fill-white" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
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

        <div
          className={`fixed ${isMobile ? "bottom-2" : "bottom-8"} left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md`}
        >
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

          <Button
            type="button"
            className="px-8 py-4 bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={() => {
              if (!hasPermission("users:create")) {
                showToast("У вас нет прав на создание пользователя", "error");
                return;
              }
              navigate({ to: "/users/new" });
            }}
          >
            Создать
          </Button>
        </div>
      </div>
    </PermissionGuard>
  );
};
