import { transportCardsApi } from "@/lib/api";
import { TransportCard } from "@/lib/types";
import { useEffect, useState, useRef, useCallback } from "react";

const SEARCH_DEBOUNCE_MS = 500;

export const useTransportCardsListPage = () => {
  const [cards, setCards] = useState<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (TransportCard & { expenses: any[]; totalExpenses: number })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const loadCards = useCallback(
    async (page: number, recordLimit: number) => {
      try {
        setIsLoading(true);
        const response = await transportCardsApi.list({
          page,
          limit: recordLimit,
          cardNumber: debouncedSearch || undefined,
        });
        setCards(response.data || []);
        setTotalRecords(response.pagination.totalRecords);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error("Ошибка загрузки транспортных карт:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearch],
  );

  useEffect(() => {
    loadCards(currentPage, limit);
  }, [currentPage, limit, loadCards]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту транспортную карту?")) {
      return;
    }

    try {
      await transportCardsApi.delete(id);
      setCards(cards.filter((c) => c.id !== id));
    } catch (error) {
      alert("Ошибка при удалении: " + (error as Error).message);
    }
  };

  return {
    cards,
    isLoading,
    currentPage,
    limit,
    totalRecords,
    totalPages,
    search,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    handleDelete,
  };
};
