import { carsApi } from "@/lib/api";
import { CarForm, carSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const useNewCarPage = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CarForm>({
    resolver: zodResolver(carSchema),
  });

  const onSubmit = async (data: CarForm) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await carsApi.create(data);
      navigate({ to: "/cars" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при создании");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    error,
    onSubmit,
  };
};
