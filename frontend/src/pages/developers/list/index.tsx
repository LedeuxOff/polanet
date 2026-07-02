import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { User } from "@/lib/types";
import { formatPhoneDisplay } from "@/lib/utils/phone";
import { Link, useNavigate } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { useDevelopersList } from "./hooks";
import { HomeIcon, MenuIcon, SearchIcon, ChevronUp, ChevronDown } from "lucide-react";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { useState } from "react";

export const DevelopersPage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);

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
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();

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
      cell: ({ getValue }) => formatPhoneDisplay(getValue<string>() || undefined) || "—",
    },
    {
      accessorKey: "roleName",
      header: "Роль",
      cell: ({ getValue }) => getValue<string>() || "—",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Разработчики</CardTitle>
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
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
      ) : (
        <DataTable
          columns={columns}
          data={developers}
          onRowClick={(row) =>
            navigate({ to: "/developers/$developerId", params: { developerId: row.id.toString() } })
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
        className={`fixed transition-all ${isMobile ? (hideBottomTabbar ? "-bottom-14" : "bottom-2") : hideBottomTabbar ? "-bottom-14" : "bottom-4"} left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-zinc-600/30 backdrop-blur-md shadow-xl border-zinc-200 rounded-2xl`}
      >
        <div
          onClick={() => setHideBottomTabbar(false)}
          className={`absolute -top-4 left-1/2 -translate-x-1/2 px-1 pb-2 bg-[rgb(194,194,197)] rounded-2xl hover:bg-[rgb(173,173,176)] flex items-center justify-center cursor-pointer z-10 transition-all ${hideBottomTabbar ? "opacity-100" : "opacity-0"}`}
        >
          <ChevronUp className="text-white w-5" />
        </div>

        <Link to="/">
          <Button type="button" className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600">
            <HomeIcon className="w-4 h-4" />
          </Button>
        </Link>

        {isMobile && (
          <Button
            type="button"
            className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
            onClick={() => setOpen(true)}
          >
            <MenuIcon className="w-4 h-4" />
          </Button>
        )}

        {hasPermission("users:create") && (
          <Button
            onClick={() => navigate({ to: "/developers/new" })}
            type="button"
            className="px-8 py-4 bg-blue-500/90 rounded-2xl hover:bg-blue-600"
          >
            Создать
          </Button>
        )}

        <Button
          onClick={() => setHideBottomTabbar(true)}
          type="button"
          className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
