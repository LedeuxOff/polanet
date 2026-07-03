import { transportCardsApi } from "@/lib/api";
import { NewTransportCardForm, newTransportCardSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const useNewTransportCardPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<NewTransportCardForm>({
    resolver: zodResolver(newTransportCardSchema),
    defaultValues: {
      status: "active",
    },
  });

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
    isSubmitting,
    error,
    onSubmit,
  };
};
