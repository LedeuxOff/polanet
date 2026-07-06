import { useNavigate, useParams } from "@tanstack/react-router";
import { useClientDetailPage } from "./hooks";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { PageError } from "@/components/screens/error";
import { ClientPageForm } from "./ui/client-page-form";
import { BottomBar } from "@/components/bottom-bar";
import { NoAccessScreen } from "@/components/screens/no-access";
import { ClientPageHead } from "./ui/client-page-head";

export const EditClientPage = () => {
  const navigate = useNavigate();
  const { clientId } = useParams({ from: "/clients/$clientId" });
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();

  const {
    isLoading,
    client,
    handleDelete,
    isDeleting,
    form,
    onSubmit,
    clientType,
    setClientType,
    isSubmitting,
    error,
  } = useClientDetailPage(clientId);

  if (isLoading || isPermissionsLoading) {
    return <PermissionsLoader />;
  }

  if (!hasPermission("clients:detail")) {
    return <NoAccessScreen />;
  }

  if (!client || error) {
    return <PageError />;
  }

  const handleSubmit = async () => {
    const data = form.getValues();
    // Проверяем права на обновление
    if (!hasPermission("clients:update")) {
      showToast("У вас нет прав на редактирование клиента", "error");
      return;
    }

    const result = await onSubmit(data);
    if (result.success) {
      showToast("Клиент успешно сохранен", "success");
      navigate({ to: "/clients" });
    } else if (result.error) {
      showToast(result.error, "error");
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-4">
      <ClientPageHead client={client} />

      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <ClientPageForm
          form={form}
          clientType={clientType}
          setClientType={setClientType}
          isSubmitting={isSubmitting}
        />

        <BottomBar
          onBack={() => navigate({ to: "/clients" })}
          isSumitting={isSubmitting}
          showDeleteButton
          handleDelete={() => {
            if (!hasPermission("clients:delete")) {
              showToast("У вас нет прав на удаление клиента", "error");
              return;
            }
            handleDelete(showToast);
          }}
          isDeleting={isDeleting}
        />
      </form>
    </div>
  );
};
