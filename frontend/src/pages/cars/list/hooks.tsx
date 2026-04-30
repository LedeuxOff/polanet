import { carsApi } from "@/lib/api";
import { Car } from "@/lib/types";
import { useEffect, useState } from "react";

export const useCarsListPage = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCars = async () => {
    try {
      const data = await carsApi.list();
      setCars(data);
    } catch (error) {
      console.error("Ошибка загрузки автомобилей:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  return {
    cars,
    isLoading,
  };
};
