import { Link, useNavigate } from "@tanstack/react-router";
import { useClientsListPage } from "./hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Client } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { HomeIcon, MenuIcon } from "lucide-react";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";

export const ClientsPage = () => {
  const navigate = useNavigate();
  const { clients, isLoading } = useClientsListPage();
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();

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
      cell: ({ getValue }) => getValue<string>() || "—",
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
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2">
              <CardTitle>Клиенты</CardTitle>

              <div className="flex items-center gap-2">
                <span className="text-sm text-black">Список</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-8">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
            ) : (
              <DataTable
                columns={columns}
                data={clients}
                onRowClick={(row) =>
                  navigate({ to: "/clients/$clientId", params: { clientId: row.id.toString() } })
                }
              />
            )}
          </CardContent>
        </Card>

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
              if (!hasPermission("clients:create")) {
                showToast("У вас нет прав на создание клиента", "error");
                return;
              }
              navigate({ to: "/clients/new" });
            }}
          >
            Создать
          </Button>
        </div>
      </div>
    </PermissionGuard>
  );
};
