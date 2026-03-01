import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React from "react";
import { DataTable } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ColumnDef } from "@tanstack/react-table";
import { api } from "@/lib/api";
import type { Car } from "@/lib/types";

export const Route = createFileRoute("/cars/")({
  component: CarsPage,
});

function CarsPage() {
  const navigate = useNavigate();
  const [cars, setCars] = React.useState<Car[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadCars = async () => {
    try {
      const data = await api.cars.list();
      setCars(data);
    } catch (error) {
      console.error("Ошибка загрузки автомобилей:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadCars();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот автомобиль?")) {
      return;
    }

    try {
      await api.cars.delete(id);
      setCars(cars.filter((c) => c.id !== id));
    } catch (error) {
      alert("Ошибка при удалении: " + (error as Error).message);
    }
  };

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
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleDelete(row.original.id)}
        >
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
          <div className="text-center py-8 text-muted-foreground">
            Загрузка...
          </div>
        ) : (
          <DataTable columns={columns} data={cars} />
        )}
      </CardContent>
    </Card>
  );
}
