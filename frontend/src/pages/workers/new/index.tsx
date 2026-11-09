import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { workersApi } from "@/lib/api";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { WorkerForm, workerSchema } from "@/lib/types";
import { FormBuilder } from "@/widgets/form-builder";
import { WorkerPageHead } from "../detail/ui/worker-page-head";
import { NO_TEAM, getWorkerSections, toWorkerInput, useTeamOptions } from "../shared";

export const NewWorkerPage = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const teams = useTeamOptions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkerForm>({
    resolver: zodResolver(workerSchema),
    defaultValues: { lastName: "", firstName: "", middleName: "", phone: "", teamId: NO_TEAM },
  });

  if (isPermissionsLoading) return <PermissionsLoader />;
  if (!hasPermission("workers:create")) return <NoAccessScreen />;

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await workersApi.create(toWorkerInput(data));
      showToast("Рабочий создан", "success");
      navigate({ to: "/workers" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Ошибка при создании", "error");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="flex flex-col gap-4 pb-4">
      <WorkerPageHead title="Создание" />
      <FormBuilder
        form={form}
        sections={getWorkerSections(teams, isSubmitting)}
        actions={{
          submit: { onSubmit: handleSubmit, isSubmitting, disabled: isSubmitting },
          back: () => navigate({ to: "/workers" }),
          delete: { onDelete: () => {}, isHide: true },
        }}
      />
    </div>
  );
};
