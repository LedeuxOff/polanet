import { usersApi } from "@/lib/api";
import { User } from "@/lib/types";
import { useEffect, useState, useCallback, useRef } from "react";

export const PAGE_OPTIONS = [1, 5, 10, 25, 50] as const;
const SEARCH_DEBOUNCE_MS = 500;

export const useDevelopersList = () => {
  const [developers, setDevelopers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Фильтры
  const [search, setSearch] = useState("");

  // Ref для debounce таймера
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const loadDevelopers = useCallback(
    async (page: number, recordLimit: number) => {
      setIsLoading(true);
      try {
        const response = await usersApi.list({
          page,
          limit: recordLimit,
          search: debouncedSearch || undefined,
          roleCode: "DEVELOPER",
        });
        setDevelopers(response.data);
        setTotalRecords(response.pagination.totalRecords);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error("Ошибка загрузки разработчиков:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearch],
  );

  useEffect(() => {
    loadDevelopers(currentPage, limit);
  }, [currentPage, limit, loadDevelopers]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);

    // Debounce: очищаем предыдущий таймер
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Устанавливаем новый таймер
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

  return {
    developers,
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
