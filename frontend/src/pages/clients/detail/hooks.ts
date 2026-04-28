import { clientsApi } from "@/lib/api";
import { Client, ClientForm, clientSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export const useClientDetailPage = (clientId: string) => {
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clientType, setClientType] = useState<"individual" | "legal">("individual");

  const form = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    clientsApi
      .get(Number(clientId))
      .then((data) => {
        setClient(data);
        setClientType(data.type);
        form.setValue("type", data.type);
        form.setValue("lastName", data.lastName || "");
        form.setValue("firstName", data.firstName || "");
        form.setValue("middleName", data.middleName || "");
        form.setValue("organizationName", data.organizationName || "");
        form.setValue("phone", data.phone || "");
        form.setValue("email", data.email || "");
        form.setValue("payerLastName", data.payerLastName || "");
        form.setValue("payerFirstName", data.payerFirstName || "");
        form.setValue("payerMiddleName", data.payerMiddleName || "");
        form.setValue("payerPhone", data.payerPhone || "");
        form.setValue("receiverLastName", data.receiverLastName || "");
        form.setValue("receiverFirstName", data.receiverFirstName || "");
        form.setValue("receiverMiddleName", data.receiverMiddleName || "");
        form.setValue("receiverPhone", data.receiverPhone || "");
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [clientId, form.setValue]);

  const onSubmit = async (data: ClientForm): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    setIsSubmitting(true);
    try {
      const updateData: Record<string, unknown> = {};
      if (data.type) updateData.type = data.type;
      if (data.lastName !== undefined) updateData.lastName = data.lastName;
      if (data.firstName !== undefined) updateData.firstName = data.firstName;
      if (data.middleName !== undefined) updateData.middleName = data.middleName;
      if (data.organizationName !== undefined) updateData.organizationName = data.organizationName;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.payerLastName !== undefined) updateData.payerLastName = data.payerLastName;
      if (data.payerFirstName !== undefined) updateData.payerFirstName = data.payerFirstName;
      if (data.payerMiddleName !== undefined) updateData.payerMiddleName = data.payerMiddleName;
      if (data.payerPhone !== undefined) updateData.payerPhone = data.payerPhone;
      if (data.receiverLastName !== undefined) updateData.receiverLastName = data.receiverLastName;
      if (data.receiverFirstName !== undefined)
        updateData.receiverFirstName = data.receiverFirstName;
      if (data.receiverMiddleName !== undefined)
        updateData.receiverMiddleName = data.receiverMiddleName;
      if (data.receiverPhone !== undefined) updateData.receiverPhone = data.receiverPhone;

      await clientsApi.update(Number(clientId), updateData);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка при обновлении";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (
    showToast: (
      message: string,
      variant: "success" | "error" | "warning" | "info" | "default",
    ) => void,
  ) => {
    if (!confirm("Вы уверены, что хотите удалить этого клиента?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await clientsApi.delete(Number(clientId));
      showToast("Клиент успешно удален", "success");
      navigate({ to: "/clients" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка при удалении";
      setError(message);
      showToast(message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isLoading,
    client,
    handleDelete,
    isDeleting,
    form,
    onSubmit,
    error,
    clientType,
    setClientType,
    isSubmitting,
  };
};
