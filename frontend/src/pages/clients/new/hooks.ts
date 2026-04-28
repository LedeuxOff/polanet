import { clientsApi } from "@/lib/api";
import { NewClientForm, newClientSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const useNewClientPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientType, setClientType] = useState<"individual" | "legal">("individual");

  const form = useForm<NewClientForm>({
    resolver: zodResolver(newClientSchema),
    defaultValues: {
      type: "individual",
      payer: {
        lastName: "",
        firstName: "",
        middleName: "",
        phone: "",
      },
      receiver: {
        lastName: "",
        firstName: "",
        middleName: "",
        phone: "",
      },
    },
  });

  const onSubmit = async (data: NewClientForm) => {
    setError(null);
    setIsSubmitting(true);
    try {
      // Преобразуем пустые строки в null и отправляем данные
      const payload = {
        ...data,
        payer: data.payer || undefined,
        receiver: data.receiver || undefined,
      };
      await clientsApi.create(payload);
      navigate({ to: "/clients" });
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
    clientType,
    setClientType,
    isSubmitting,
  };
};
