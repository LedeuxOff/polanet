import { useCallback, useEffect, useRef, useState } from "react";
import { workersApi } from "@/lib/api";
import type { Worker } from "@/lib/types";

const SEARCH_DEBOUNCE_MS = 500;

export const useWorkersListPage = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setDebouncedSearch(value.trim());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    workersApi
      .list({ page: currentPage, limit, search: debouncedSearch || undefined })
      .then((res) => {
        if (cancelled) return;
        setWorkers(res.data);
        setTotalRecords(res.pagination.totalRecords);
        setTotalPages(res.pagination.totalPages);
      })
      .catch((err) => console.error("Ошибка загрузки рабочих:", err))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [currentPage, limit, debouncedSearch]);

  const handlePageChange = useCallback((page: number) => setCurrentPage(page), []);
  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  return {
    workers,
    isLoading,
    currentPage,
    limit,
    totalRecords,
    totalPages,
    search,
    handleSearchChange,
    handlePageChange,
    handleLimitChange,
  };
};
