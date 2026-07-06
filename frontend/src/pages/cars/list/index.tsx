import { useNavigate } from "@tanstack/react-router";
import { useCarsListPage } from "./hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Car } from "@/lib/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { BottomBar } from "@/components/bottom-bar";
import { DataTableSearchFilter } from "@/components/data-table/data-table-search-filter";

export const CarsPage = () => {
  const navigate = useNavigate();

  const {
    cars,
    isLoading,
    currentPage,
    limit,
    totalRecords,
    totalPages,
    searchBrand,
    searchLicensePlate,
    handlePageChange,
    handleLimitChange,
    handleBrandSearchChange,
    handleLicensePlateSearchChange,
  } = useCarsListPage();
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();

  const columns: ColumnDef<Car>[] = [
    {
      accessorKey: "brand",
      header: "Марка",
      cell: ({ row }) => row.getValue("brand"),
    },
    {
      accessorKey: "licensePlate",
      header: "Гос номер",
    },
  ];

  return (
    <PermissionGuard permission="cars:list">
      <div className="flex flex-col gap-4">
        <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
          <CardHeader>
            <CardTitle>Автомобили</CardTitle>
          </CardHeader>
        </Card>

        {/* Search inputs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <DataTableSearchFilter
            search={searchBrand}
            handleSearchChange={handleBrandSearchChange}
            placeholder="Поиск по марке"
          />
          <DataTableSearchFilter
            search={searchLicensePlate}
            handleSearchChange={handleLicensePlateSearchChange}
            placeholder="Поиск по гос номеру"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
        ) : (
          <DataTable
            columns={columns}
            data={cars}
            pagination={{ currentPage, limit, totalRecords, totalPages }}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onRowClick={(row) =>
              navigate({ to: "/cars/$carId", params: { carId: row.id.toString() } })
            }
          />
        )}

        <BottomBar
          onCreate={() => {
            if (!hasPermission("cars:create")) {
              showToast("У вас нет прав на создание автомобиля", "error");
              return;
            }
            navigate({ to: "/cars/new" });
          }}
        />
      </div>
    </PermissionGuard>
  );
};
