import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { UserRoundIcon } from "lucide-react";
import { listFilterControlClass, ListPageHead, ListPagination } from "@/components/data-list";
import { BottomBar } from "@/components/bottom-bar";
import { DataTableSearchFilter } from "@/components/data-table/data-table-search-filter";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { screedClientsApi } from "@/lib/api";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import type { ScreedClient } from "@/lib/types";
import { ScreedClientsTable } from "./ui/screed-clients-table";

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

  return (
    <PermissionGuard permission="screed-clients:list">
      <div className="flex flex-col gap-4">
        <ListPageHead
          icon={<UserRoundIcon />}
          iconClassName="bg-teal-100 text-teal-600 dark:bg-teal-400/15 dark:text-teal-300"
          title="Клиенты стяжки"
          description="Заказчики работ по стяжке"
        />

        <DataTableSearchFilter
          search={search}
          handleSearchChange={handleSearchChange}
          placeholder="Поиск по имени или телефону"
          inputClassName={listFilterControlClass}
        />

        <ScreedClientsTable
          clients={clients}
          isLoading={isLoading}
          skeletonCount={Math.min(limit, 8)}
          onOpen={(client) =>
            navigate({
              to: "/screed-clients/$screedClientId",
              params: { screedClientId: String(client.id) },
            })
          }
        />

        <ListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          limit={limit}
          onPageChange={setCurrentPage}
          onLimitChange={(l) => {
            setLimit(l);
            setCurrentPage(1);
          }}
        />

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
