import { useNavigate } from "@tanstack/react-router";
import { useNewCarPage } from "./hooks";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { CarNewPageHead } from "./ui/car-new-page-head";
import { FormBuilder } from "@/widgets/form-builder";

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

      <FormBuilder
        form={form}
        sections={[
          {
            id: "main-info",
            label: "Основная информация",
            fields: [
              {
                id: "brand",
                label: "Марка",
                type: "text",
                disabled: isSubmitting,
                className: "col-span-3",
              },
              {
                id: "licensePlate",
                label: "Гос номер",
                type: "text",
                disabled: isSubmitting,
                className: "col-span-3",
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
        }}
      />
    </div>
  );
};
