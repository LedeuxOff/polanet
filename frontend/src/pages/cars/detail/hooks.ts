import { carsApi } from "@/lib/api";
import { Car, CarForm, carSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export const useCarDetailPage = () => {
  const { carId } = useParams({ from: "/cars/$carId" });
  const navigate = useNavigate();

  const [car, setCar] = useState<Car | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<CarForm>({
    resolver: zodResolver(carSchema),
  });

  useEffect(() => {
    carsApi
      .get(Number(carId))
      .then((data) => {
        setCar(data);
        form.setValue("brand", data.brand);
        form.setValue("licensePlate", data.licensePlate);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [carId, form.setValue]);

  const onSubmit = async (data: CarForm) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const updateData: Record<string, unknown> = {};
      if (data.brand) updateData.brand = data.brand;
      if (data.licensePlate) updateData.licensePlate = data.licensePlate;

      await carsApi.update(Number(carId), updateData);
      navigate({ to: "/cars" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при обновлении");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этот автомобиль?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await carsApi.delete(Number(carId));
      navigate({ to: "/cars" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при удалении");
    } finally {
      setIsDeleting(false);
    }
  };

  return { isLoading, car, handleDelete, isDeleting, form, onSubmit, error, isSubmitting };
};
