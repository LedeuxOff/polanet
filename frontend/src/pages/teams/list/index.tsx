import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { HardHatIcon } from "lucide-react";
import { listFilterControlClass, ListPageHead, ListPagination } from "@/components/data-list";
import { TeamsTable } from "./ui/teams-table";
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

  return (
    <PermissionGuard permission="teams:list">
      <div className="flex flex-col gap-4">
        <ListPageHead
          icon={<HardHatIcon />}
          iconClassName="bg-sky-100 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300"
          title="Бригады"
          description="Состав бригад и их видимость в календаре работ"
        />

        <DataTableSearchFilter
          search={search}
          handleSearchChange={(v) => {
            setSearch(v);
            setCurrentPage(1);
          }}
          placeholder="Поиск по названию"
          inputClassName={listFilterControlClass}
        />

        <TeamsTable
          teams={pageData}
          isLoading={isLoading}
          skeletonCount={Math.min(limit, 6)}
          onOpen={(team) => navigate({ to: "/teams/$teamId", params: { teamId: String(team.id) } })}
        />

        <ListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={filtered.length}
          limit={limit}
          onPageChange={setCurrentPage}
          onLimitChange={(l) => {
            setLimit(l);
            setCurrentPage(1);
          }}
        />

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
