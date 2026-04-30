import { Link, useNavigate } from "@tanstack/react-router";
import { useTransportCardsListPage } from "./hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HomeIcon, MenuIcon } from "lucide-react";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";

export const TransportCardsPage = () => {
  const navigate = useNavigate();
  const { cards, isLoading } = useTransportCardsListPage();
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return <Badge className="bg-green-600">Активна</Badge>;
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Неактивна
      </Badge>
    );
  };

  const columns: ColumnDef<(typeof cards)[0]>[] = [
    {
      accessorKey: "cardNumber",
      header: "Номер карты",
      cell: ({ row }) => <span>{row.getValue("cardNumber")}</span>,
    },
    {
      accessorKey: "driver",
      header: "Водитель",
      cell: ({ row }) => {
        const driver = row.original.driver;
        return driver ? (
          <span className="text-sm">
            {driver.lastName} {driver.firstName} {driver.middleName}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Не назначен</span>
        );
      },
    },
    {
      accessorKey: "totalExpenses",
      header: "Общие расходы",
      cell: ({ getValue }) => `${getValue<number>()} ₽`,
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
  ];

  return (
    <PermissionGuard permission="transport-cards:list">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2">
              <CardTitle>Транспортные карты</CardTitle>

              <div className="flex items-center gap-2">
                <span className="text-sm text-black">Список</span>
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
                data={cards}
                onRowClick={(row) =>
                  navigate({
                    to: "/transport-cards/$cardId",
                    params: { cardId: row.id.toString() },
                  })
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
              if (!hasPermission("transport-cards:create")) {
                showToast("У вас нет прав на создание карты", "error");
                return;
              }
              navigate({ to: "/transport-cards/new" });
            }}
          >
            Создать
          </Button>
        </div>
      </div>
    </PermissionGuard>
  );
};
