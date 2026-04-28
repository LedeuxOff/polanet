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

  return {
    clients,
    isLoading,
  };
};
