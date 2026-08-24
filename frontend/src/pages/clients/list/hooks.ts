import { clientsApi } from "@/lib/api";
import { Client } from "@/lib/types";
import { useEffect, useState, useCallback, useRef } from "react";

export const PAGE_OPTIONS = [1, 5, 10, 25, 50] as const;
const SEARCH_DEBOUNCE_MS = 500;

export const useClientsListPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Поиск с debounce
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Фильтр по типу клиента
  const [clientType, setClientType] = useState("all");

  // Ref для debounce таймера
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce для поиска
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setClientType(value);
    setCurrentPage(1);
  }, []);

  const loadClients = useCallback(
    async (page: number, recordLimit: number) => {
      setIsLoading(true);
      try {
        const response = await clientsApi.list({
          page,
          limit: recordLimit,
          search: debouncedSearch || undefined,
          type: clientType === "all" ? undefined : clientType,
        });
        setClients(response.data);
        setTotalRecords(response.pagination.totalRecords);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error("Ошибка загрузки клиентов:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearch, clientType],
  );

  useEffect(() => {
    loadClients(currentPage, limit);
  }, [currentPage, limit, loadClients]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  const getTypeFilterLabel = (): string => {
    switch (clientType) {
      case "individual":
        return "Физ. лицо";
      case "legal":
        return "Юр. лицо";
      default:
        return "Все";
    }
  };

  return {
    clients,
    isLoading,
    currentPage,
    limit,
    totalRecords,
    totalPages,
    search,
    clientType,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    handleTypeChange,
    getTypeFilterLabel,
  };
};
