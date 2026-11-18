import { CarFrontIcon } from "lucide-react";
import { listCardClass } from "@/components/data-list";
import { useNavigate } from "@tanstack/react-router";
import { useCarDetailPage } from "./hooks";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { PageError } from "@/components/screens/error";
import { CarPageHead } from "./ui/car-page-head";
import { FormBuilder } from "@/widgets/form-builder";

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

      <FormBuilder
        form={form}
        sections={[
          {
            id: "main-info",
            label: "Данные автомобиля",
            description: "Марка и государственный номер",
            icon: <CarFrontIcon />,
            cardClassName: listCardClass,
            fields: [
              {
                id: "brand",
                label: "Марка",
                type: "text",
                disabled: isSubmitting,
              },
              {
                id: "licensePlate",
                label: "Гос номер",
                type: "text",
                disabled: isSubmitting,
              },
            ],
          },
        ]}
        actions={{
          submit: {
            onSubmit: handleSubmit,
            isSubmitting: isSubmitting,
            disabled: isSubmitting,
          },
          back: () => navigate({ to: "/cars" }),
          delete: {
            onDelete: () => {
              if (!hasPermission("cars:delete")) {
                showToast("У вас нет прав на удаление автомобиля", "error");
                return;
              }
              handleDelete();
            },
            isDeleting: isDeleting,
            disabled: isDeleting,
          },
        }}
      />
    </div>
  );
};
