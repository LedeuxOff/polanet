import { ContactIcon, PackageCheckIcon, WalletIcon } from "lucide-react";
import { listCardClass } from "@/components/data-list";
import { useNavigate } from "@tanstack/react-router";
import { useNewClientPage } from "./hooks";
import { ClientNewPageHead } from "./ui/client-new-page-head";
import { FormBuilder } from "@/widgets/form-builder";

export const NewClientPage = () => {
  const navigate = useNavigate();
  const { form, onSubmit, isSubmitting } = useNewClientPage();

  const clientType = form.watch("type");

  return (
    <div className="flex flex-col gap-4">
      <ClientNewPageHead />

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
                disabled: isSubmitting,
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
              { id: "payer.lastName", label: "Фамилия", type: "text", disabled: isSubmitting },
              { id: "payer.firstName", label: "Имя", type: "text", disabled: isSubmitting },
              { id: "payer.middleName", label: "Отчество", type: "text", disabled: isSubmitting },
              { id: "payer.phone", label: "Телефон", type: "phone", disabled: isSubmitting },
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
              { id: "receiver.lastName", label: "Фамилия", type: "text", disabled: isSubmitting },
              { id: "receiver.firstName", label: "Имя", type: "text", disabled: isSubmitting },
              {
                id: "receiver.middleName",
                label: "Отчество",
                type: "text",
                disabled: isSubmitting,
              },
              { id: "receiver.phone", label: "Телефон", type: "phone", disabled: isSubmitting },
            ],
          },
        ]}
        actions={{
          submit: {
            onSubmit: form.handleSubmit(onSubmit),
            isSubmitting: isSubmitting,
            disabled: isSubmitting,
          },
          back: () => navigate({ to: "/clients" }),
        }}
      />
    </div>
  );
};
