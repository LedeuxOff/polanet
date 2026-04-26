import { Link, useNavigate } from "@tanstack/react-router";
import { useCarsListPage } from "./hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Car } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";

export const CarsPage = () => {
  const navigate = useNavigate();
  const { cars, isLoading, handleDelete } = useCarsListPage();

  const columns: ColumnDef<Car>[] = [
    {
      accessorKey: "brand",
      header: "Марка",
      cell: ({ row }) => (
        <button
          onClick={() =>
            navigate({
              to: "/cars/$carId",
              params: { carId: String(row.original.id) },
            })
          }
          className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border bg-background hover:bg-muted/50 transition-colors shadow-sm text-sm"
        >
          <span className="font-medium">{row.getValue("brand")}</span>
        </button>
      ),
    },
    {
      accessorKey: "licensePlate",
      header: "Гос номер",
    },
    {
      id: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original.id)}>
          Удалить
        </Button>
      ),
    },
  ];

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Автомобили</CardTitle>
          <Link to="/cars/new">
            <Button>Добавить автомобиль</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
        ) : (
          <DataTable columns={columns} data={cars} />
        )}
      </CardContent>
    </Card>
  );
};
