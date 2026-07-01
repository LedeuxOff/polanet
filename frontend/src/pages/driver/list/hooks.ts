import { driversApi } from "@/lib/api";
import { Driver } from "@/lib/types";
import { useEffect, useState, useCallback, useRef } from "react";

export const PAGE_OPTIONS = [1, 5, 10, 25, 50] as const;
const SEARCH_DEBOUNCE_MS = 500;

export const useDriversListPage = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Поиск с debounce
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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

  const loadDrivers = useCallback(
    async (page: number, recordLimit: number) => {
      setIsLoading(true);
      try {
        const response = await driversApi.list({
          page,
          limit: recordLimit,
          search: debouncedSearch || undefined,
        });
        setDrivers(response.data);
        setTotalRecords(response.pagination.totalRecords);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error("Ошибка загрузки водителей:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearch],
  );

  useEffect(() => {
    loadDrivers(currentPage, limit);
  }, [currentPage, limit, loadDrivers]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  return {
    drivers,
    isLoading,
    currentPage,
    limit,
    totalRecords,
    totalPages,
    search,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
  };
};
