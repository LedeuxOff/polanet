import { useNavigate, useParams } from "@tanstack/react-router";
import { useUserDetailPage } from "./hooks";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { useAuth } from "@/lib/contexts/auth-context";
import { useState } from "react";
import { PageError } from "../../../components/screens/error";
import { UserPageHead } from "./ui/user-page-head";
import { UserPageTabs } from "./ui/user-page-tabs";
import { UserPageDetailsTab } from "./ui/user-page-details-tab";
import { UserPageTransportCardTab } from "./ui/user-page-card-tab";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { BottomBar } from "@/components/bottom-bar";

export const EditUserPage = () => {
  const [activeTab, setActiveTab] = useState("details");

  const navigate = useNavigate();
  const { userId } = useParams({ from: "/users/$userId" });
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();

  const { user: currentUser } = useAuth();

  const {
    isLoading,
    user,
    form,
    onSubmit,
    error,
    isSubmitting,
    roles,
    isSendingPassword,
    handleSendPassword,
    isUnbindingTelegram,
    handleUnbindTelegram,
    isDeleting,
    handleDelete,
    // Transport card
    availableCards,
    isFetchingCards,
    isAttachingCard,
    isDetachingCard,
    handleAttachCard,
    handleDetachCard,
  } = useUserDetailPage();

  const isOwnUser = currentUser?.id === Number(userId);
  const isDriver = user?.roleCode === "DRIVER";

  if (isLoading || isPermissionsLoading) {
    return <PermissionsLoader />;
  }

  if (!hasPermission("users:detail")) {
    return <NoAccessScreen />;
  }

  if (!user || error) {
    return <PageError />;
  }

  return (
    <div className="flex flex-col gap-4">
      <UserPageHead user={user} />

      <form
        onSubmit={form.handleSubmit(async (data) => {
          if (!hasPermission("users:update")) {
            showToast("У вас нет прав на редактирование пользователя", "error");
            return { success: false };
          }
          const result = await onSubmit(data);
          if (result.success) {
            showToast("Пользователь успешно сохранен", "success");
            navigate({ to: "/users" });
          } else if (result.error) {
            showToast(result.error, "error");
          }
        })}
      >
        <div className="flex gap-4">
          <div className="flex flex-col gap-4 flex-1">
            {/* Tabs */}
            <UserPageTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Details Tab */}
            {activeTab === "details" && (
              <UserPageDetailsTab
                form={form}
                isSubmitting={isSubmitting}
                roles={roles}
                user={user}
                handleUnbindTelegram={handleUnbindTelegram}
                isUnbindingTelegram={isUnbindingTelegram}
                isOwnUser={isOwnUser}
              />
            )}

            {/* Transport Card Tab */}
            {activeTab === "transport-card" && (
              <UserPageTransportCardTab
                user={user}
                availableCards={availableCards}
                isFetchingCards={isFetchingCards}
                handleDetachCard={handleDetachCard}
                handleAttachCard={handleAttachCard}
                isDetachingCard={isDetachingCard}
                isAttachingCard={isAttachingCard}
              />
            )}
          </div>
        </div>

        <BottomBar
          isSumitting={isSubmitting}
          onBack={() => navigate({ to: "/users" })}
          // Удаление
          showDeleteButton={user?.roleCode === "DEVELOPER" && !isOwnUser}
          handleDelete={handleDelete}
          isDeleting={isDeleting}
          // Отправка пароля
          handleSendPassword={handleSendPassword}
          isSendingPassword={isSendingPassword}
          sendPasswordDisabled={isSendingPassword || !user?.telegramChatId || isDriver}
        />
      </form>
    </div>
  );
};
