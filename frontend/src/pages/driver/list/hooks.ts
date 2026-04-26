import { driversApi } from "@/lib/api";
import { Driver } from "@/lib/types";
import { useEffect, useState } from "react";

export const useDriversListPage = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDrivers = async () => {
    try {
      const data = await driversApi.list();
      setDrivers(data);
    } catch (error) {
      console.error("Ошибка загрузки водителей:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этого водителя?")) {
      return;
    }

    try {
      await driversApi.delete(id);
      setDrivers(drivers.filter((d) => d.id !== id));
    } catch (error) {
      alert("Ошибка при удалении: " + (error as Error).message);
    }
  };

  return {
    drivers,
    isLoading,
    handleDelete,
  };
};
