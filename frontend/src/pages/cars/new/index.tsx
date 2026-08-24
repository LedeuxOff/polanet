import { useNavigate } from "@tanstack/react-router";
import { useNewCarPage } from "./hooks";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { CarNewPageHead } from "./ui/car-new-page-head";
import { CarNewPageForm } from "./ui/car-new-page-form";
import { BottomBar } from "@/components/bottom-bar";

export const NewCarPage = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const { form, isSubmitting, onSubmit } = useNewCarPage();

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!hasPermission("cars:create")) {
      showToast("У вас нет прав на создание автомобиля", "error");
      return;
    }
    await onSubmit(data);
    showToast("Автомобиль успешно создан", "success");
    navigate({ to: "/cars" });
  });

  if (isPermissionsLoading) {
    return <PermissionsLoader />;
  }

  if (!hasPermission("cars:create")) {
    return <NoAccessScreen />;
  }

  return (
    <div className="flex flex-col gap-4">
      <CarNewPageHead />

      <form onSubmit={handleSubmit}>
        <CarNewPageForm form={form} disabled={isSubmitting} />

        <BottomBar onBack={() => navigate({ to: "/cars" })} isSumitting={isSubmitting} />
      </form>
    </div>
  );
};
