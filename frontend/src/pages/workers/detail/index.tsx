import { useNavigate } from "@tanstack/react-router";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { PageError } from "@/components/screens/error";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { getWorkerName } from "@/lib/types";
import { FormBuilder } from "@/widgets/form-builder";
import { getWorkerSections, useTeamOptions } from "../shared";
import { useWorkerDetailPage } from "./hooks";
import { WorkerPageHead } from "./ui/worker-page-head";

export const WorkerDetailPage = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const teams = useTeamOptions();
  const { worker, isLoading, form, isSubmitting, isDeleting, save, remove } =
    useWorkerDetailPage();

  if (isLoading || isPermissionsLoading) return <PermissionsLoader />;
  if (!hasPermission("workers:detail")) return <NoAccessScreen />;
  if (!worker) return <PageError />;

  const canUpdate = hasPermission("workers:update");

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!canUpdate) {
      showToast("У вас нет прав на редактирование рабочего", "error");
      return;
    }
    try {
      await save(data);
      showToast("Рабочий сохранён", "success");
      navigate({ to: "/workers" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Ошибка при сохранении", "error");
    }
  });

  const handleDelete = async () => {
    if (!hasPermission("workers:delete")) {
      showToast("У вас нет прав на удаление рабочего", "error");
      return;
    }
    if (!confirm(`Удалить рабочего «${getWorkerName(worker)}»?`)) return;
    try {
      await remove();
      showToast("Рабочий удалён", "success");
      navigate({ to: "/workers" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Ошибка при удалении", "error");
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-4">
      <WorkerPageHead title={getWorkerName(worker)} />
      <FormBuilder
        form={form}
        sections={getWorkerSections(teams, isSubmitting || !canUpdate)}
        actions={{
          submit: { onSubmit: handleSubmit, isSubmitting, disabled: isSubmitting },
          back: () => navigate({ to: "/workers" }),
          delete: {
            onDelete: handleDelete,
            isDeleting,
            disabled: isDeleting,
            isHide: !hasPermission("workers:delete"),
          },
        }}
      />
    </div>
  );
};
