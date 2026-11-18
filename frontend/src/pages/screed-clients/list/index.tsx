import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { BottomBar } from "@/components/bottom-bar";
import { DataTableSearchFilter } from "@/components/data-table/data-table-search-filter";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { screedClientsApi } from "@/lib/api";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import type { ScreedClient } from "@/lib/types";
import { formatPhoneDisplay } from "@/lib/utils/phone";
import { getScreedClientName } from "../shared";

const SEARCH_DEBOUNCE_MS = 500;

export const ScreedClientsPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();
  const [clients, setClients] = useState<ScreedClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    screedClientsApi
      .list({ page: currentPage, limit, search: debouncedSearch || undefined })
      .then((res) => {
        if (cancelled) return;
        setClients(res.data);
        setTotalRecords(res.pagination.totalRecords);
        setTotalPages(res.pagination.totalPages);
      })
      .catch((err) => console.error("Ошибка загрузки клиентов стяжки:", err))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [currentPage, limit, debouncedSearch]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setDebouncedSearch(value.trim());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
  };

  const columns: ColumnDef<ScreedClient>[] = [
    {
      accessorKey: "name",
      header: "Имя",
      cell: ({ row }) => getScreedClientName(row.original),
    },
    {
      accessorKey: "phone",
      header: "Телефон",
      cell: ({ row }) => formatPhoneDisplay(row.original.phone) || "—",
    },
    {
      accessorKey: "worksCount",
      header: "Работ",
      cell: ({ row }) => row.original.worksCount,
    },
  ];

  return (
    <PermissionGuard permission="screed-clients:list">
      <div className="flex flex-col gap-4">
        <Card className="rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
          <CardHeader>
            <CardTitle>Клиенты стяжки</CardTitle>
          </CardHeader>
        </Card>

        <DataTableSearchFilter
          search={search}
          handleSearchChange={handleSearchChange}
          placeholder="Поиск по имени или телефону"
        />

        {isLoading && clients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
        ) : (
          <DataTable
            columns={columns}
            data={clients}
            pagination={{ currentPage, limit, totalRecords, totalPages }}
            onPageChange={setCurrentPage}
            onLimitChange={(l) => {
              setLimit(l);
              setCurrentPage(1);
            }}
            onRowClick={(row) =>
              navigate({
                to: "/screed-clients/$screedClientId",
                params: { screedClientId: String(row.id) },
              })
            }
          />
        )}

        <BottomBar
          onCreate={() => {
            if (!hasPermission("screed-clients:create")) {
              showToast("У вас нет прав на создание клиента", "error");
              return;
            }
            navigate({ to: "/screed-clients/new" });
          }}
        />
      </div>
    </PermissionGuard>
  );
};
