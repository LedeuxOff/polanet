import { NewOrderForm, orderSchema } from "@/lib/types";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ordersApi } from "@/lib/api";

export const useNewOrderPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<NewOrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      status: "draft",
      hasPass: false,
    },
  });

  const onSubmit = async (data: NewOrderForm) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await ordersApi.create(data);
      navigate({ to: "/orders" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при создании");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    error,
    isSubmitting,
  };
};
