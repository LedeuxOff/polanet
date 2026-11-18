import { ContactIcon, ShieldCheckIcon, UserRoundIcon } from "lucide-react";
import { usersCardClass } from "../ui/user-identity";
import { useNavigate } from "@tanstack/react-router";
import { useNewUserPage } from "./hooks";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { NewUserPageHead } from "./ui/new-user-page-head";
import { FormBuilder } from "@/widgets/form-builder";

export const NewUserPage = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();

  const { form, onSubmit, isSubmitting, roles } = useNewUserPage();

  if (isPermissionsLoading) {
    return <PermissionsLoader />;
  }

  if (!hasPermission("users:create")) {
    return <NoAccessScreen />;
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!hasPermission("users:create")) {
      showToast("У вас нет прав на создание пользователя", "error");
      return { success: false };
    }
    const result = await onSubmit(data);
    if (result.success) {
      showToast("Пользователь успешно создан", "success");
      navigate({ to: "/users" });
    } else if (result.error) {
      showToast(result.error, "error");
    }
  });

  return (
    <div className="flex flex-col gap-4">
      <NewUserPageHead />

      <FormBuilder
        form={form}
        sections={[
          {
            id: "personal",
            label: "Личные данные",
            description: "ФИО и дата рождения",
            icon: <UserRoundIcon />,
            cardClassName: usersCardClass,
            fields: [
              { id: "lastName", label: "Фамилия", type: "text", disabled: isSubmitting },
              { id: "firstName", label: "Имя", type: "text", disabled: isSubmitting },
              { id: "middleName", label: "Отчество", type: "text", disabled: isSubmitting },
              { id: "birthDate", label: "Дата рождения", type: "date", disabled: isSubmitting },
            ],
          },
          {
            id: "contacts",
            label: "Контакты",
            description: "Почта для входа и телефон",
            icon: <ContactIcon />,
            cardClassName: usersCardClass,
            fields: [
              { id: "email", label: "Email", type: "email", disabled: isSubmitting },
              { id: "phone", label: "Телефон", type: "phone", disabled: isSubmitting },
            ],
          },
          {
            id: "access",
            label: "Доступ",
            description: "Роль определяет права сотрудника в системе",
            icon: <ShieldCheckIcon />,
            cardClassName: usersCardClass,
            fields: [
              {
                id: "roleId",
                label: "Роль",
                type: "select",
                disabled: isSubmitting,
                select: {
                  options: roles
                    .filter((item) => !["DEVELOPER"].includes(item.code))
                    .map((item) => ({ id: item.id.toString(), name: item.name })),
                },
              },
            ],
          },
        ]}
        actions={{
          submit: {
            onSubmit: handleSubmit,
            isSubmitting: isSubmitting,
            disabled: isSubmitting,
            isHide: false,
            label: isSubmitting ? "Сохранение..." : "Сохранить",
          },
          back: () => navigate({ to: "/users" }),
        }}
      />
    </div>
  );
};
