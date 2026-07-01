import { Link, useNavigate } from "@tanstack/react-router";
import { useRolesListPage } from "./hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { ChevronDown, ChevronUp, HomeIcon, MenuIcon } from "lucide-react";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";
import { useState } from "react";

export const RolesPage = () => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);

  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();

  const { roles, isLoading, canCreate } = useRolesListPage();

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
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle>Роли</CardTitle>
        </CardHeader>
      </Card>

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

      <div
        className={`fixed transition-all ${isMobile ? "bottom-2" : hideBottomTabbar ? "-bottom-14" : "bottom-4"} left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-zinc-600/30 backdrop-blur-md shadow-xl border-zinc-200 rounded-2xl`}
      >
        <div
          onClick={() => setHideBottomTabbar(false)}
          className={`absolute -top-4 left-1/2 -translate-x-1/2 px-1 pb-2 bg-[rgb(194,194,197)] rounded-2xl hover:bg-[rgb(173,173,176)] flex items-center justify-center cursor-pointer z-10 transition-all ${hideBottomTabbar ? "opacity-100" : "opacity-0"}`}
        >
          <ChevronUp className="text-white w-5" />
        </div>

        <Link to="/">
          <Button type="button" className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600">
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

        {canCreate && (
          <Link to="/roles/new">
            <Button
              type="button"
              className="px-8 py-4 bg-blue-500/90 rounded-2xl hover:bg-blue-600"
            >
              Создать
            </Button>
          </Link>
        )}

        <Button
          onClick={() => setHideBottomTabbar(true)}
          type="button"
          className="px-3 py-4 bg-zinc-500/90 rounded-2xl hover:bg-zinc-600"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
