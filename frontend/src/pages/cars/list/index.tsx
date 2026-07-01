import { Link, useNavigate } from "@tanstack/react-router";
import { useCarsListPage } from "./hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Car } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { ChevronDown, ChevronUp, HomeIcon, MenuIcon, SearchIcon } from "lucide-react";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const CarsPage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);

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
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();

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
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle>Автомобили</CardTitle>
          </CardHeader>
        </Card>

        {/* Search inputs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Поиск по марке"
              value={searchBrand}
              onChange={(e) => handleBrandSearchChange(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Поиск по гос номеру"
              value={searchLicensePlate}
              onChange={(e) => handleLicensePlateSearchChange(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
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
              className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
              onClick={() => setOpen(true)}
            >
              <MenuIcon className="w-4 h-4" />
            </Button>
          )}

          <Button
            type="button"
            className="px-8 py-4 bg-blue-500/90 rounded-2xl hover:bg-blue-600"
            onClick={() => {
              if (!hasPermission("cars:create")) {
                showToast("У вас нет прав на создание автомобиля", "error");
                return;
              }
              navigate({ to: "/cars/new" });
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
