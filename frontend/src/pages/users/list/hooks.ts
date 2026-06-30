import { usersApi, rolesApi } from "@/lib/api";
import { User, Role } from "@/lib/types";
import { useEffect, useState, useCallback, useRef } from "react";

export const PAGE_OPTIONS = [1, 5, 10, 25, 50] as const;
const SEARCH_DEBOUNCE_MS = 500;

export const useUsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Фильтры
  const [search, setSearch] = useState("");
  const [roleCode, setRoleCode] = useState("all");
  const [roles, setRoles] = useState<Role[]>([]);

  // Ref для debounce таймера
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const loadUsers = useCallback(
    async (page: number, recordLimit: number) => {
      setIsLoading(true);
      try {
        const response = await usersApi.list({
          page,
          limit: recordLimit,
          search: debouncedSearch || undefined,
          roleCode: roleCode === "all" ? undefined : roleCode,
        });
        setUsers(response.data);
        setTotalRecords(response.pagination.totalRecords);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error("Ошибка загрузки пользователей:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearch, roleCode],
  );

  useEffect(() => {
    loadUsers(currentPage, limit);
  }, [currentPage, limit, loadUsers]);

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

  const handleRoleChange = useCallback((value: string) => {
    setRoleCode(value);
    setCurrentPage(1);
  }, []);

  // Загрузка списка ролей
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await rolesApi.listAll();
        setRoles(response);
      } catch (error) {
        console.error("Ошибка загрузки ролей:", error);
      }
    };
    loadRoles();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      return;
    }

    try {
      await usersApi.delete(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (error) {
      alert("Ошибка при удалении: " + (error as Error).message);
    }
  };

  return {
    users,
    isLoading,
    currentPage,
    limit,
    totalRecords,
    totalPages,
    search,
    roleCode,
    roles,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    handleRoleChange,
    handleDelete,
  };
};
