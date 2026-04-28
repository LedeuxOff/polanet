import { Link, useNavigate } from "@tanstack/react-router";
import { useDriversListPage } from "./hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Driver } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { HomeIcon } from "lucide-react";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";

export const DriversPage = () => {
  const navigate = useNavigate();
  const { drivers, isLoading } = useDriversListPage();
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();

  const columns: ColumnDef<Driver>[] = [
    {
      accessorKey: "lastName",
      header: "Фамилия",
      cell: ({ row }) => row.getValue("lastName"),
    },
    {
      accessorKey: "firstName",
      header: "Имя",
    },
    {
      accessorKey: "middleName",
      header: "Отчество",
      cell: ({ getValue }) => getValue<string>() || "—",
    },
    {
      accessorKey: "phone",
      header: "Телефон",
      cell: ({ getValue }) => getValue<string>() || "—",
    },
  ];

  return (
    <PermissionGuard permission="drivers:list">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2">
              <CardTitle>Водители</CardTitle>

              <div className="flex items-center gap-2">
                <span className="text-sm text-black">Список водителей</span>
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
                data={drivers}
                onRowClick={(row) =>
                  navigate({ to: "/drivers/$driverId", params: { driverId: row.id.toString() } })
                }
              />
            )}
          </CardContent>
        </Card>

        <div className="fixed bottom-8 left-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md">
          <Link to="/">
            <Button type="button" className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900">
              <HomeIcon className="w-4 h-4" />
            </Button>
          </Link>

          <Button
            type="button"
            className="px-8 py-4 bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={() => {
              if (!hasPermission("drivers:create")) {
                showToast("У вас нет прав на создание водителя", "error");
                return;
              }
              navigate({ to: "/drivers/new" });
            }}
          >
            Создать водителя
          </Button>
        </div>
      </div>
    </PermissionGuard>
  );
};
