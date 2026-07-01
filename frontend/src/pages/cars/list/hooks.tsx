import { carsApi } from "@/lib/api";
import { Car } from "@/lib/types";
import { useEffect, useState, useCallback, useRef } from "react";

export const PAGE_OPTIONS = [1, 5, 10, 25, 50] as const;
const SEARCH_DEBOUNCE_MS = 500;

export const useCarsListPage = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Поиск с debounce
  const [searchBrand, setSearchBrand] = useState("");
  const [searchLicensePlate, setSearchLicensePlate] = useState("");
  const [debouncedBrand, setDebouncedBrand] = useState("");
  const [debouncedLicensePlate, setDebouncedLicensePlate] = useState("");

  // Ref для debounce таймеров
  const brandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const licensePlateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce для поиска по марке
  const handleBrandSearchChange = useCallback((value: string) => {
    setSearchBrand(value);

    if (brandTimeoutRef.current) {
      clearTimeout(brandTimeoutRef.current);
    }

    brandTimeoutRef.current = setTimeout(() => {
      setDebouncedBrand(value);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  // Debounce для поиска по гос номеру
  const handleLicensePlateSearchChange = useCallback((value: string) => {
    setSearchLicensePlate(value);

    if (licensePlateTimeoutRef.current) {
      clearTimeout(licensePlateTimeoutRef.current);
    }

    licensePlateTimeoutRef.current = setTimeout(() => {
      setDebouncedLicensePlate(value);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      if (brandTimeoutRef.current) {
        clearTimeout(brandTimeoutRef.current);
      }
      if (licensePlateTimeoutRef.current) {
        clearTimeout(licensePlateTimeoutRef.current);
      }
    };
  }, []);

  const loadCars = useCallback(
    async (page: number, recordLimit: number) => {
      setIsLoading(true);
      try {
        const response = await carsApi.list({
          page,
          limit: recordLimit,
          brand: debouncedBrand || undefined,
          licensePlate: debouncedLicensePlate || undefined,
        });
        setCars(response.data);
        setTotalRecords(response.pagination.totalRecords);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error("Ошибка загрузки автомобилей:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedBrand, debouncedLicensePlate],
  );

  useEffect(() => {
    loadCars(currentPage, limit);
  }, [currentPage, limit, loadCars]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  return {
    cars,
    isLoading,
    currentPage,
    limit,
    totalRecords,
    totalPages,
    searchBrand,
    searchLicensePlate,
    handlePageChange,
    handleLimitChange,
    handleBrandSearchChange,
    handleLicensePlateSearchChange,
  };
};
