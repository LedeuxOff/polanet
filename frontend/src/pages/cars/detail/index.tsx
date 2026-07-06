import { useNavigate } from "@tanstack/react-router";
import { useCarDetailPage } from "./hooks";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { PageError } from "@/components/screens/error";
import { CarPageHead } from "./ui/car-page-head";
import { CarPageForm } from "./ui/car-page-form";
import { BottomBar } from "@/components/bottom-bar";

export const EditCarPage = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const { isLoading, car, handleDelete, isDeleting, form, onSubmit, isSubmitting, error } =
    useCarDetailPage();

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!hasPermission("cars:update")) {
      showToast("У вас нет прав на редактирование автомобиля", "error");
      return;
    }
    await onSubmit(data);
    showToast("Автомобиль успешно сохранен", "success");
    navigate({ to: "/cars" });
  });

  if (isLoading || isPermissionsLoading) {
    return <PermissionsLoader />;
  }

  if (!hasPermission("cars:detail")) {
    return <NoAccessScreen />;
  }

  if (!car || error) {
    return <PageError />;
  }

  return (
    <div className="flex flex-col gap-4">
      <CarPageHead car={car} />

      <form onSubmit={handleSubmit}>
        <CarPageForm form={form} disabled={isSubmitting} />

        <BottomBar
          onBack={() => navigate({ to: "/cars" })}
          showDeleteButton
          handleDelete={() => {
            if (!hasPermission("cars:delete")) {
              showToast("У вас нет прав на удаление автомобиля", "error");
              return;
            }
            handleDelete();
          }}
          isSumitting={isSubmitting}
          isDeleting={isDeleting}
        />
      </form>
    </div>
  );
};
