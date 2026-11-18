import { Role, User, UserForm } from "@/lib/types";
import { FormBuilder } from "@/widgets/form-builder";
import { UseFormReturn } from "react-hook-form";
import { UserDetailPageTelegramController } from "./user-page-telegram-controller";
import { BaseSyntheticEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/contexts/auth-context";
import { ContactIcon, ShieldCheckIcon, UserRoundIcon } from "lucide-react";
import { usersCardClass } from "../../../ui/user-identity";

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
  const { user: currentUser } = useAuth();
  const isCurrentUserDeveloper = currentUser?.roleCode === "DEVELOPER";

  const isDriver = user?.roleCode === "DRIVER";
  const disabled = isSubmitting || isDeleting || isDetachingCard;

  return (
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
            { id: "lastName", label: "Фамилия", type: "text", disabled },
            { id: "firstName", label: "Имя", type: "text", disabled },
            { id: "middleName", label: "Отчество", type: "text", disabled },
            { id: "birthDate", label: "Дата рождения", type: "date", disabled },
          ],
        },
        {
          id: "contacts",
          label: "Контакты",
          description: "Почта для входа, телефон и Telegram",
          icon: <ContactIcon />,
          cardClassName: usersCardClass,
          fields: [
            { id: "email", label: "Email", type: "email", disabled },
            { id: "phone", label: "Телефон", type: "phone", disabled },
            {
              id: "telegramId",
              label: "Телеграмм контроллер",
              type: "controller",
              Controller: () => (
                <UserDetailPageTelegramController
                  key="telegram"
                  user={user}
                  handleUnbindTelegram={handleUnbindTelegram}
                  isUnbindingTelegram={isUnbindingTelegram}
                  isOwnUser={isOwnUser}
                />
              ),
            },
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
              disabled,
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
          isHide: !isCurrentUserDeveloper || isOwnUser,
        },
        back: () => navigate({ to: "/users" }),
      }}
    />
  );
};
