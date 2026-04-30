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

  return {
    drivers,
    isLoading,
  };
};
