import { clientsApi } from "@/lib/api";
import { Client, ClientForm, clientSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export const useClientDetailPage = () => {
  const { clientId } = useParams({ from: "/clients/$clientId" });
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
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [clientId, form.setValue]);

  const onSubmit = async (data: ClientForm) => {
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

      await clientsApi.update(Number(clientId), updateData);
      navigate({ to: "/clients" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при обновлении");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этого клиента?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await clientsApi.delete(Number(clientId));
      navigate({ to: "/clients" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при удалении");
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
