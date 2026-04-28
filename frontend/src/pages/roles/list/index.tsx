import { Link, useNavigate } from "@tanstack/react-router";
import { useRolesListPage } from "./hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { HomeIcon } from "lucide-react";

export const RolesPage = () => {
  const navigate = useNavigate();
  const { roles, isLoading, handleDelete } = useRolesListPage();

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "code",
      header: "Код",
      cell: ({ row }) => row.getValue("code"),
    },
    {
      accessorKey: "name",
      header: "Название",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Роли</CardTitle>

            <div className="flex items-center gap-2">
              <span className="text-sm text-black">Список ролей</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
          ) : (
            <DataTable
              columns={columns}
              data={roles}
              onRowClick={(row) =>
                navigate({ to: "/roles/$roleId", params: { roleId: row.id.toString() } })
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

        <Link to="/roles/new">
          <Button type="button" className="px-8 py-4 bg-blue-600 rounded-md hover:bg-blue-700">
            Создать роль
          </Button>
        </Link>
      </div>
    </div>
  );
};
