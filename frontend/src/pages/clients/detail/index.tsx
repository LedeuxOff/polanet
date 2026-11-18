import { ContactIcon, PackageCheckIcon, WalletIcon } from "lucide-react";
import { listCardClass } from "@/components/data-list";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useClientDetailPage } from "./hooks";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { PageError } from "@/components/screens/error";
import { NoAccessScreen } from "@/components/screens/no-access";
import { ClientPageHead } from "./ui/client-page-head";
import { FormBuilder } from "@/widgets/form-builder";

export const EditClientPage = () => {
  const navigate = useNavigate();
  const { clientId } = useParams({ from: "/clients/$clientId" });
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();

  const { isLoading, client, handleDelete, isDeleting, form, onSubmit, isSubmitting, error } =
    useClientDetailPage(clientId);

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

  const clientType = form.watch("type");

  return (
    <div className="flex flex-col gap-4 pb-4">
      <ClientPageHead client={client} />

      <FormBuilder
        form={form}
        sections={[
          {
            id: "main-info",
            label: "Основная информация",
            description: "Тип клиента, имя или название и контакты",
            icon: <ContactIcon />,
            cardClassName: listCardClass,
            fields: [
              {
                id: "type",
                label: "Тип клиента",
                type: "select",
                disabled: true,
                className: "col-span-full",
                select: {
                  options: [
                    { id: "individual", name: "Физическое лицо" },
                    { id: "legal", name: "Юридическое лицо" },
                  ],
                },
              },
              {
                id: "lastName",
                label: "Фамилия",
                type: "text",
                disabled: isSubmitting,
                hide: clientType === "legal",
              },
              {
                id: "firstName",
                label: "Имя",
                type: "text",
                disabled: isSubmitting,
                hide: clientType === "legal",
              },
              {
                id: "middleName",
                label: "Отчество",
                type: "text",
                disabled: isSubmitting,
                hide: clientType === "legal",
              },
              {
                id: "organizationName",
                label: "Название организации",
                type: "text",
                disabled: isSubmitting,
                hide: clientType === "individual",
              },
              {
                id: "phone",
                label: "Телефон",
                type: "phone",
                disabled: isSubmitting,
              },
              {
                id: "email",
                label: "Email",
                type: "email",
                disabled: isSubmitting,
              },
            ],
          },
          {
            id: "payer",
            label: "Плательщик",
            description: "Оплачивает заявки по умолчанию",
            icon: <WalletIcon />,
            cardClassName: listCardClass,
            className: "lg:grid-cols-4",
            fields: [
              { id: "payerLastName", label: "Фамилия", type: "text", disabled: isSubmitting },
              { id: "payerFirstName", label: "Имя", type: "text", disabled: isSubmitting },
              { id: "payerMiddleName", label: "Отчество", type: "text", disabled: isSubmitting },
              { id: "payerPhone", label: "Телефон", type: "phone", disabled: isSubmitting },
            ],
          },
          {
            id: "receiver",
            label: "Приёмщик",
            description: "Принимает груз на объекте",
            icon: <PackageCheckIcon />,
            cardClassName: listCardClass,
            className: "lg:grid-cols-4",
            fields: [
              { id: "receiverLastName", label: "Фамилия", type: "text", disabled: isSubmitting },
              { id: "receiverFirstName", label: "Имя", type: "text", disabled: isSubmitting },
              { id: "receiverMiddleName", label: "Отчество", type: "text", disabled: isSubmitting },
              { id: "receiverPhone", label: "Телефон", type: "phone", disabled: isSubmitting },
            ],
          },
        ]}
        actions={{
          submit: {
            onSubmit: handleSubmit,
            isSubmitting: isSubmitting,
            disabled: isSubmitting,
          },
          back: () => navigate({ to: "/clients" }),
          delete: {
            onDelete: () => {
              if (!hasPermission("clients:delete")) {
                showToast("У вас нет прав на удаление клиента", "error");
                return;
              }
              handleDelete(showToast);
            },
            isDeleting: isDeleting,
            disabled: isDeleting,
          },
        }}
      />
    </div>
  );
};
