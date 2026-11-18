import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { screedClientsApi } from "@/lib/api";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { FormBuilder } from "@/widgets/form-builder";
import {
  ScreedClientForm,
  emptyScreedClientForm,
  getScreedClientSections,
  screedClientFormSchema,
  toScreedClientInput,
} from "../shared";
import { ScreedClientPageHead } from "../detail/ui/screed-client-page-head";

export const NewScreedClientPage = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ScreedClientForm>({
    resolver: zodResolver(screedClientFormSchema),
    defaultValues: emptyScreedClientForm,
  });

  if (isPermissionsLoading) return <PermissionsLoader />;
  if (!hasPermission("screed-clients:create")) return <NoAccessScreen />;

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await screedClientsApi.create(toScreedClientInput(data));
      showToast("Клиент создан", "success");
      navigate({ to: "/screed-clients" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Ошибка при создании", "error");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="flex flex-col gap-4 pb-28">
      <ScreedClientPageHead title="Создание" />
      <FormBuilder
        form={form}
        sections={getScreedClientSections(form, isSubmitting)}
        actions={{
          submit: { onSubmit: handleSubmit, isSubmitting, disabled: isSubmitting },
          back: () => navigate({ to: "/screed-clients" }),
        }}
      />
    </div>
  );
};
