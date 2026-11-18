import { Role, User, UserForm } from "@/lib/types";
import { FormBuilder } from "@/widgets/form-builder";
import { UseFormReturn } from "react-hook-form";
import { UserDetailPageTelegramController } from "./user-page-telegram-controller";
import { BaseSyntheticEvent } from "react";
import { useNavigate } from "@tanstack/react-router";

interface Props {
  form: UseFormReturn<UserForm>;
  roles: Role[];
  user: User;
  handleUnbindTelegram: () => Promise<void>;
  handleSubmit: (e?: BaseSyntheticEvent | undefined) => Promise<void>;
  handleSendPassword: () => Promise<void>;
  handleDelete: () => Promise<void>;
  isSubmitting: boolean;
  isUnbindingTelegram: boolean;
  isOwnUser: boolean;
  isDeleting: boolean;
  isDetachingCard: boolean;
  isSendingPassword: boolean;
}

export const UserPageDetailsTab = ({
  form,
  roles,
  user,
  handleUnbindTelegram,
  handleSubmit,
  handleSendPassword,
  handleDelete,
  isSubmitting,
  isUnbindingTelegram,
  isOwnUser,
  isDeleting,
  isDetachingCard,
  isSendingPassword,
}: Props) => {
  const navigate = useNavigate();

  const isDriver = user?.roleCode === "DRIVER";

  return (
    <FormBuilder
      form={form}
      sections={[
        {
          id: "main-info",
          label: "Основная информация",
          fields: [
            {
              id: "lastName",
              label: "Фамилия",
              type: "text",
              disabled: isSubmitting || isDeleting || isDetachingCard,
            },
            {
              id: "firstName",
              label: "Имя",
              type: "text",
              disabled: isSubmitting || isDeleting || isDetachingCard,
            },
            {
              id: "middleName",
              label: "Отчество",
              type: "text",
              disabled: isSubmitting || isDeleting || isDetachingCard,
            },
            {
              id: "email",
              label: "Email",
              type: "email",
              disabled: isSubmitting || isDeleting || isDetachingCard,
            },
            {
              id: "phone",
              label: "Телефон",
              type: "phone",
              disabled: isSubmitting || isDeleting || isDetachingCard,
            },
            {
              id: "telegramId",
              label: "Телеграмм контроллер",
              type: "controller",
              Controller: () => (
                <UserDetailPageTelegramController
                  user={user}
                  handleUnbindTelegram={handleUnbindTelegram}
                  isUnbindingTelegram={isUnbindingTelegram}
                  isOwnUser={isOwnUser}
                />
              ),
            },
            {
              id: "birthDate",
              label: "Дата рождения",
              type: "date",
              disabled: isSubmitting || isDeleting || isDetachingCard,
            },
            {
              id: "roleId",
              label: "Роль",
              type: "select",
              disabled: isSubmitting || isDeleting || isDetachingCard,
              select: {
                options: roles.map((item) => ({ id: item.id.toString(), name: item.name })),
              },
            },
          ],
        },
      ]}
      actions={{
        submit: {
          onSubmit: handleSubmit,
          isSubmitting: isSubmitting,
          disabled: isSubmitting || isDeleting || isDetachingCard,
          isHide: false,
        },
        resetPassword: {
          onReset: handleSendPassword,
          isReseting: isSendingPassword,
          disabled:
            isSendingPassword || !user?.telegramChatId || isDriver || isSubmitting || isDeleting,
          isHide: false,
        },
        delete: {
          onDelete: handleDelete,
          isDeleting: isDeleting,
          disabled: isSubmitting || isDeleting || isDetachingCard,
          isHide: user?.roleCode !== "DEVELOPER" || isOwnUser,
        },
        back: () => navigate({ to: "/users" }),
      }}
    />
  );
};
