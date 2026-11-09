import { useNewTransportCardPage } from "./hooks";
import { useNavigate } from "@tanstack/react-router";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { CardNewPageHead } from "./ui/card-new-page-head";
import { FormBuilder } from "@/widgets/form-builder";

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
    showToast("Топливная карта успешно создана", "success");
    navigate({ to: "/transport-cards" });
  });

  return (
    <div className="flex flex-col gap-4">
      <CardNewPageHead />

      <FormBuilder
        form={form}
        sections={[
          {
            id: "main-info",
            label: "Основная информация",
            fields: [
              {
                id: "cardNumber",
                label: "Номер карты",
                type: "text",
                disabled: isSubmitting,
                className: "col-span-3",
              },
              {
                id: "status",
                label: "Статус",
                type: "select",
                disabled: isSubmitting,
                select: {
                  options: [
                    { id: "active", name: "Активна" },
                    { id: "inactive", name: "Неактивна" },
                  ],
                },
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
            label: isSubmitting ? "Сохранение..." : "Сохранить",
          },
          back: () => navigate({ to: "/transport-cards" }),
        }}
      />
    </div>
  );
};
