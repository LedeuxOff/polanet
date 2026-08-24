import { NewOrderForm, orderSchema } from "@/lib/types";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ordersApi } from "@/lib/api";
import { useTemplateSelector } from "./hooks/use-template-selector";
import { useToast } from "@/lib/contexts/toast-context";

export const useNewOrderPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const form = useForm<NewOrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      status: "draft",
      hasPass: false,
    },
  });

  const templateSelector = useTemplateSelector(form);

  const onSubmit = async (data: NewOrderForm) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await ordersApi.create(data);
      showToast("Заявка успешно создана", "success");
      navigate({ to: "/orders" });
    } catch (err) {
      const errorString = err instanceof Error ? err.message : "Ошибка при создании";
      // Извлекаем details из сообщения, если они есть
      const detailsMatch = errorString.match(/Details: (.*)/s);
      const mainMessage = detailsMatch ? errorString.replace(/\nDetails:.*$/s, "") : errorString;
      const details = detailsMatch ? detailsMatch[1] : null;

      // Формируем полное сообщение для отображения
      const displayMessage = details ? `${mainMessage}\n\nDetails:\n${details}` : mainMessage;

      setError(mainMessage);
      showToast(displayMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    error,
    isSubmitting,
    templateSelector,
  };
};
