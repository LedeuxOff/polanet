import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { BottomBar } from "@/components/bottom-bar";
import { DataTableSearchFilter } from "@/components/data-table/data-table-search-filter";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { teamsApi } from "@/lib/api";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import type { Team } from "@/lib/types";

export const TeamsPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    teamsApi
      .list(true)
      .then(setTeams)
      .catch((err) => console.error("Ошибка загрузки бригад:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Бригад немного — фильтруем и листаем на клиенте
  const filtered = teams.filter((t) => t.name.toLowerCase().includes(search.trim().toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const pageData = filtered.slice((currentPage - 1) * limit, currentPage * limit);

  const columns: ColumnDef<Team>[] = [
    { accessorKey: "name", header: "Название" },
    {
      accessorKey: "memberCount",
      header: "Участников",
      cell: ({ row }) => row.original.memberCount ?? 0,
    },
    {
      accessorKey: "isActive",
      header: "В календаре",
      cell: ({ row }) => (row.original.isActive ? "Да" : "Скрыта"),
    },
  ];

  return (
    <PermissionGuard permission="teams:list">
      <div className="flex flex-col gap-4">
        <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
          <CardHeader>
            <CardTitle>Бригады</CardTitle>
          </CardHeader>
        </Card>

        <DataTableSearchFilter
          search={search}
          handleSearchChange={(v) => {
            setSearch(v);
            setCurrentPage(1);
          }}
          placeholder="Поиск по названию"
        />

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
        ) : (
          <DataTable
            columns={columns}
            data={pageData}
            pagination={{ currentPage, limit, totalRecords: filtered.length, totalPages }}
            onPageChange={setCurrentPage}
            onLimitChange={(l) => {
              setLimit(l);
              setCurrentPage(1);
            }}
            onRowClick={(row) =>
              navigate({ to: "/teams/$teamId", params: { teamId: String(row.id) } })
            }
          />
        )}

        <BottomBar
          onCreate={() => {
            if (!hasPermission("teams:manage")) {
              showToast("У вас нет прав на создание бригады", "error");
              return;
            }
            navigate({ to: "/teams/new" });
          }}
        />
      </div>
    </PermissionGuard>
  );
};
