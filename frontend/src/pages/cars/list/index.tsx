import { useNavigate } from "@tanstack/react-router";
import { PAGE_OPTIONS, useCarsListPage } from "./hooks";
import { CarFrontIcon } from "lucide-react";
import { listFilterControlClass, ListPageHead, ListPagination } from "@/components/data-list";
import { CarsTable } from "./ui/cars-table";
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

  return (
    <PermissionGuard permission="cars:list">
      <div className="flex flex-col gap-4">
        <ListPageHead
          icon={<CarFrontIcon />}
          iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300"
          title="Автомобили"
          description="Автопарк компании"
        />

        {/* Search inputs */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <DataTableSearchFilter
            search={searchBrand}
            handleSearchChange={handleBrandSearchChange}
            placeholder="Поиск по марке"
            inputClassName={listFilterControlClass}
          />
          <DataTableSearchFilter
            search={searchLicensePlate}
            handleSearchChange={handleLicensePlateSearchChange}
            placeholder="Поиск по гос. номеру"
            inputClassName={listFilterControlClass}
          />
        </div>

        <CarsTable
          cars={cars}
          isLoading={isLoading}
          skeletonCount={Math.min(limit, 8)}
          onOpen={(car) => navigate({ to: "/cars/$carId", params: { carId: car.id.toString() } })}
        />

        <ListPagination
          pageOptions={PAGE_OPTIONS}
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          limit={limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />

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
