import { Link, useNavigate } from "@tanstack/react-router";
import { useClientsListPage } from "./hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Client } from "@/lib/types";
import { formatPhoneDisplay } from "@/lib/utils/phone";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import {
  HomeIcon,
  MenuIcon,
  SearchIcon,
  ChevronDownIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

export const ClientsPage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);

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
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();
  const [showTypePopover, setShowTypePopover] = useState(false);

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "name",
      header: "Наименование",
      cell: ({ row }) => {
        const client = row.original;
        const name =
          client.type === "individual"
            ? `${client.lastName} ${client.firstName} ${client.middleName || ""}`.trim()
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
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle>Клиенты</CardTitle>
          </CardHeader>
        </Card>

        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Поиск по наименованию, телефону или email"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <Popover open={showTypePopover} onOpenChange={setShowTypePopover}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="rounded-xl flex items-center gap-2 min-w-[180px]"
              >
                {getTypeFilterLabel()}
                <ChevronDownIcon className="h-4 w-4 ml-auto" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-2" align="end">
              <div className="flex flex-col gap-1">
                {[
                  { value: "all", label: "Все" },
                  { value: "individual", label: "Физ. лицо" },
                  { value: "legal", label: "Юр. лицо" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={clientType === option.value ? "secondary" : "ghost"}
                    className={`justify-start ${clientType === option.value ? "font-medium" : ""}`}
                    onClick={() => {
                      handleTypeChange(option.value);
                      setShowTypePopover(false);
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
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

        <div
          className={`fixed transition-all ${isMobile ? (hideBottomTabbar ? "-bottom-[58px]" : "bottom-2") : hideBottomTabbar ? "-bottom-[58px]" : "bottom-4"} left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-zinc-600/30 backdrop-blur-md shadow-xl border-zinc-200 rounded-2xl`}
        >
          <div
            onClick={() => setHideBottomTabbar(false)}
            className={`absolute -top-4 left-1/2 -translate-x-1/2 px-1 pb-2 bg-[rgb(194,194,197)] rounded-2xl hover:bg-[rgb(173,173,176)] flex items-center justify-center cursor-pointer z-10 transition-all ${hideBottomTabbar ? "opacity-100" : "opacity-0"}`}
          >
            <ChevronUp className="text-white w-5" />
          </div>

          <Link to="/">
            <Button
              type="button"
              className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
            >
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
            className="px-8 py-4 bg-blue-500/90 rounded-2xl hover:bg-blue-600"
            onClick={() => {
              if (!hasPermission("clients:create")) {
                showToast("У вас нет прав на создание клиента", "error");
                return;
              }
              navigate({ to: "/clients/new" });
            }}
          >
            Создать
          </Button>

          <Button
            onClick={() => setHideBottomTabbar(true)}
            type="button"
            className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </PermissionGuard>
  );
};
