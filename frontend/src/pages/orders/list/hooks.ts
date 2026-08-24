import { ordersApi } from "@/lib/api";
import { Order } from "@/lib/types";
import { useEffect, useState, useCallback, useRef } from "react";

export interface OrdersFilters {
  id: string;
  status: string;
  customerDebt: string;
  companyDebt: string;
  dateFrom: string;
  dateTo: string;
}

const defaultFilters: OrdersFilters = {
  id: "",
  status: "all",
  customerDebt: "",
  companyDebt: "",
  dateFrom: "",
  dateTo: "",
};

export const PAGE_OPTIONS = [1, 5, 10, 25, 50] as const;
const SEARCH_DEBOUNCE_MS = 500;

export const useOrdersListPage = () => {
  const [orders, setOrders] = useState<
    (Order & {
      receivedAmount: number;
      pendingAmount: number;
      customerDebt: number;
      companyDebt: number;
    })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<OrdersFilters>(defaultFilters);

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Debounce для поисковой строки по ID (500ms)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedId, setDebouncedId] = useState("");

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedId(filters.id);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filters.id]);

  const loadOrders = useCallback(
    async (page: number, recordLimit: number) => {
      setIsLoading(true);
      try {
        const query: Record<string, string | number> = {
          page,
          limit: recordLimit,
        };
        // Не отправляем "all" и пустые значения на сервер
        if (debouncedId && debouncedId !== "all") query.id = debouncedId;
        if (filters.status && filters.status !== "all") query.status = filters.status;
        if (filters.customerDebt && filters.customerDebt !== "all")
          query.customerDebt = filters.customerDebt;
        if (filters.companyDebt && filters.companyDebt !== "all")
          query.companyDebt = filters.companyDebt;
        if (filters.dateFrom) query.dateFrom = filters.dateFrom;
        if (filters.dateTo) query.dateTo = filters.dateTo;

        const response = await ordersApi.list(Object.keys(query).length > 0 ? query : undefined);
        setOrders(response.data);
        setTotalRecords(response.pagination.totalRecords);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error("Ошибка загрузки заявок:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      debouncedId,
      filters.status,
      filters.customerDebt,
      filters.companyDebt,
      filters.dateFrom,
      filters.dateTo,
    ],
  );

  useEffect(() => {
    loadOrders(currentPage, limit);
  }, [currentPage, limit, loadOrders]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  const updateFilter = <K extends keyof OrdersFilters>(key: K, value: OrdersFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setDebouncedId("");
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "" && v !== "all");

  return {
    orders,
    isLoading,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    currentPage,
    limit,
    totalRecords,
    totalPages,
    handlePageChange,
    handleLimitChange,
    reloadOrders: loadOrders,
  };
};
