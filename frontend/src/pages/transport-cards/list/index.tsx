import { Link, useNavigate } from "@tanstack/react-router";
import { useTransportCardsListPage } from "./hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";

export const TransportCardsPage = () => {
  const navigate = useNavigate();
  const { cards, isLoading, handleDelete } = useTransportCardsListPage();

  const columns: ColumnDef<(typeof cards)[0]>[] = [
    {
      accessorKey: "cardNumber",
      header: "Номер карты",
      cell: ({ row }) => (
        <button
          onClick={() =>
            navigate({
              to: "/transport-cards/$cardId",
              params: { cardId: String(row.original.id) },
            })
          }
          className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border bg-background hover:bg-muted/50 transition-colors shadow-sm text-sm"
        >
          <span className="font-medium">{row.getValue("cardNumber")}</span>
        </button>
      ),
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
      id: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate({
                to: "/transport-cards/$cardId",
                params: { cardId: String(row.original.id) },
              })
            }
          >
            Открыть
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original.id)}>
            Удалить
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Транспортные карты</CardTitle>
          <Link to="/transport-cards/new">
            <Button>Добавить карту</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
        ) : (
          <DataTable columns={columns} data={cards} />
        )}
      </CardContent>
    </Card>
  );
};
