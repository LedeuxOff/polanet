import { driversApi } from "@/lib/api";
import { NewDriverForm, newDriverSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const useNewDriverPage = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<NewDriverForm>({
    resolver: zodResolver(newDriverSchema),
  });

  const onSubmit = async (data: NewDriverForm) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await driversApi.create(data);
      navigate({ to: "/drivers" });
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
