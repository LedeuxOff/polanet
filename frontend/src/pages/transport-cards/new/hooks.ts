import { driversApi, transportCardsApi } from "@/lib/api";
import { Driver, NewTransportCardForm, newTransportCardSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export const useNewTransportCardPage = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<NewTransportCardForm>({
    resolver: zodResolver(newTransportCardSchema),
    defaultValues: {
      status: "active",
    },
  });

  useEffect(() => {
    driversApi.list().then(setDrivers).catch(console.error);
  }, []);

  const onSubmit = async (data: NewTransportCardForm) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await transportCardsApi.create(data);
      navigate({ to: "/transport-cards" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при создании");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    drivers,
    isSubmitting,
    error,
    onSubmit,
  };
};
