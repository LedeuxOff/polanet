import { clientsApi } from "@/lib/api";
import { Client } from "@/lib/types";
import { useEffect, useState } from "react";

export const useClientsListPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadClients = async () => {
    try {
      const data = await clientsApi.list();
      setClients(data);
    } catch (error) {
      console.error("Ошибка загрузки клиентов:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этого клиента?")) {
      return;
    }

    try {
      await clientsApi.delete(id);
      setClients(clients.filter((c) => c.id !== id));
    } catch (error) {
      alert("Ошибка при удалении: " + (error as Error).message);
    }
  };

  return {
    handleDelete,
    clients,
    isLoading,
  };
};
