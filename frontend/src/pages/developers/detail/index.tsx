import { useNavigate, useParams } from "@tanstack/react-router";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { ListEmptyState } from "@/components/data-list";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { useAuth } from "@/lib/contexts/auth-context";
import { FormBuilder } from "@/widgets/form-builder";
import { UserPageHead } from "@/pages/users/detail/ui/user-page-head";
import { UserDetailPageTelegramController } from "@/pages/users/detail/ui/user-page-details-tab/user-page-telegram-controller";
import { useDeveloperDetailPage, DeveloperForm } from "./hooks";
import { getDeveloperSections } from "../ui";

export const EditDeveloperPage = () => {
  const navigate = useNavigate();
  const { developerId } = useParams({ from: "/developers/$developerId" });
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const isOwnUser = currentUser?.id === Number(developerId);

  const {
    isLoading,
    developer,
    form,
    onSubmit,
    isSubmitting,
    isSendingPassword,
    handleSendPassword,
    isUnbindingTelegram,
    handleUnbindTelegram,
    isDeleting,
    handleDelete,
  } = useDeveloperDetailPage();

  if (isLoading || isPermissionsLoading) return <PermissionsLoader />;
  if (!hasPermission("users:detail")) return <NoAccessScreen />;
  if (!developer) {
    return <ListEmptyState title="Разработчик не найден" text="Возможно, он был удалён" />;
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!hasPermission("users:update")) {
      showToast("У вас нет прав на редактирование разработчика", "error");
      return;
    }
    const result = await onSubmit(data);
    if (result.success) {
      showToast("Разработчик успешно сохранен", "success");
      navigate({ to: "/developers" });
    } else if (result.error) {
      showToast(result.error, "error");
    }
  });

  return (
    <div className="flex flex-col gap-4">
      <UserPageHead user={developer} section={{ label: "Разработчики", href: "/developers" }} />

      <FormBuilder
        form={form}
        sections={getDeveloperSections<DeveloperForm>(isSubmitting || isDeleting, () => (
          <UserDetailPageTelegramController
            key="telegram"
            user={developer}
            handleUnbindTelegram={handleUnbindTelegram}
            isUnbindingTelegram={isUnbindingTelegram}
            isOwnUser={isOwnUser}
            canUnbind={!!developer.telegramChatId && isOwnUser}
          />
        ))}
        actions={{
          submit: {
            onSubmit: handleSubmit,
            isSubmitting,
            disabled: isSubmitting || isDeleting,
          },
          resetPassword: {
            onReset: handleSendPassword,
            isReseting: isSendingPassword,
            disabled: isSendingPassword || !developer.telegramChatId || isSubmitting,
          },
          delete: {
            onDelete: handleDelete,
            isDeleting,
            disabled: isDeleting || isSubmitting,
            isHide: isOwnUser,
          },
          back: () => navigate({ to: "/developers" }),
        }}
      />
    </div>
  );
};
