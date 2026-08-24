import { useNewTransportCardPage } from "./hooks";
import { useNavigate } from "@tanstack/react-router";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { CardNewPageHead } from "./ui/card-new-page-head";
import { CardNewPageForm } from "./ui/card-new-page-form";
import { BottomBar } from "@/components/bottom-bar";

export const NewTransportCardPage = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const { form, isSubmitting, onSubmit } = useNewTransportCardPage();

  if (isPermissionsLoading) {
    return <PermissionsLoader />;
  }

  if (!hasPermission("transport-cards:create")) {
    return <NoAccessScreen />;
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!hasPermission("transport-cards:create")) {
      showToast("У вас нет прав на создание карты", "error");
      return;
    }
    await onSubmit(data);
    showToast("Транспортная карта успешно создана", "success");
    navigate({ to: "/transport-cards" });
  });

  return (
    <div className="flex flex-col gap-4">
      <CardNewPageHead />

      <form onSubmit={handleSubmit}>
        <CardNewPageForm form={form} isSubmitting={isSubmitting} />

        <BottomBar
          onBack={() => navigate({ to: "/transport-cards" })}
          isSumitting={isSubmitting}
          saveLabel={isSubmitting ? "Сохранение..." : "Сохранить"}
        />
      </form>
    </div>
  );
};
