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
  status: "",
  customerDebt: "",
  companyDebt: "",
  dateFrom: "",
  dateTo: "",
};

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
  const [debouncedId, setDebouncedId] = useState("");

  // Debounce для поисковой строки по ID (500ms)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const query: Record<string, string> = {};
      // Не отправляем "all" и пустые значения на сервер
      if (debouncedId && debouncedId !== "all") query.id = debouncedId;
      if (filters.status && filters.status !== "all") query.status = filters.status;
      if (filters.customerDebt && filters.customerDebt !== "all")
        query.customerDebt = filters.customerDebt;
      if (filters.companyDebt && filters.companyDebt !== "all")
        query.companyDebt = filters.companyDebt;
      if (filters.dateFrom) query.dateFrom = filters.dateFrom;
      if (filters.dateTo) query.dateTo = filters.dateTo;

      const data = await ordersApi.list(Object.keys(query).length > 0 ? query : undefined);
      setOrders(data);
    } catch (error) {
      console.error("Ошибка загрузки заявок:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedId,
    filters.status,
    filters.customerDebt,
    filters.companyDebt,
    filters.dateFrom,
    filters.dateTo,
  ]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateFilter = <K extends keyof OrdersFilters>(key: K, value: OrdersFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setDebouncedId("");
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "" && v !== "all");

  return {
    orders,
    isLoading,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    reloadOrders: loadOrders,
  };
};
