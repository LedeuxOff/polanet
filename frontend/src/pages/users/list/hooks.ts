import { usersApi } from "@/lib/api";
import { User } from "@/lib/types";
import { useEffect, useState } from "react";

export const useUsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch (error) {
      console.error("Ошибка загрузки пользователей:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    isLoading,
    handleDelete,
  };
};
