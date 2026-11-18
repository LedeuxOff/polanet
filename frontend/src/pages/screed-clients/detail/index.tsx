import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "@tanstack/react-router";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { PageError } from "@/components/screens/error";
import { screedClientsApi } from "@/lib/api";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import type { ScreedClient } from "@/lib/types";
import { FormBuilder } from "@/widgets/form-builder";
import {
  ScreedClientForm,
  getScreedClientName,
  getScreedClientSections,
  screedClientFormSchema,
  toScreedClientForm,
  toScreedClientInput,
} from "../shared";
import { ScreedClientPageHead } from "./ui/screed-client-page-head";
import { ScreedClientWorks } from "./ui/screed-client-works";

export const ScreedClientDetailPage = () => {
  const navigate = useNavigate();
  const { screedClientId } = useParams({ from: "/screed-clients/$screedClientId" });
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();

  const [client, setClient] = useState<ScreedClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<ScreedClientForm>({ resolver: zodResolver(screedClientFormSchema) });

  useEffect(() => {
    setIsLoading(true);
    screedClientsApi
      .get(Number(screedClientId))
      .then((data) => {
        setClient(data);
        form.reset(toScreedClientForm(data));
      })
      .catch(() => setClient(null))
      .finally(() => setIsLoading(false));
  }, [screedClientId, form]);

  if (isLoading || isPermissionsLoading) return <PermissionsLoader />;
  if (!hasPermission("screed-clients:detail")) return <NoAccessScreen />;
  if (!client) return <PageError />;

  const canUpdate = hasPermission("screed-clients:update");
  const canDelete = hasPermission("screed-clients:delete");

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!canUpdate) {
      showToast("У вас нет прав на редактирование клиента", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      await screedClientsApi.update(client.id, toScreedClientInput(data));
      showToast("Клиент сохранён", "success");
      navigate({ to: "/screed-clients" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Ошибка при сохранении", "error");
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleDelete = async () => {
    if (!canDelete) {
      showToast("У вас нет прав на удаление клиента", "error");
      return;
    }
    const worksNote = client.worksCount
      ? ` Его работы (${client.worksCount}) останутся в календаре без клиента.`
      : "";
    if (!confirm(`Удалить клиента «${getScreedClientName(client)}»?${worksNote}`)) return;
    setIsDeleting(true);
    try {
      await screedClientsApi.delete(client.id);
      showToast("Клиент удалён", "success");
      navigate({ to: "/screed-clients" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Ошибка при удалении", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ScreedClientPageHead client={client} />
      {hasPermission("works:list") && <ScreedClientWorks clientId={client.id} />}
      <FormBuilder
        form={form}
        sections={getScreedClientSections(form, isSubmitting || !canUpdate)}
        actions={{
          submit: {
            onSubmit: handleSubmit,
            isSubmitting,
            disabled: isSubmitting,
            isHide: !canUpdate,
          },
          back: () => navigate({ to: "/screed-clients" }),
          delete: { onDelete: handleDelete, isDeleting, disabled: isDeleting, isHide: !canDelete },
        }}
      />
    </div>
  );
};
