import { useNavigate } from "@tanstack/react-router";
import { useNewUserPage } from "./hooks";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import { BottomBar } from "@/components/bottom-bar";
import { PermissionsLoader } from "@/components/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/no-access";
import { NewUserPageHead } from "./ui/new-user-page-head";
import { NewUserPageForm } from "./ui/new-user-page-form";

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

  return (
    <div className="flex flex-col gap-4">
      <NewUserPageHead />

      <form
        onSubmit={form.handleSubmit(async (data) => {
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
        })}
      >
        <NewUserPageForm form={form} disabled={isSubmitting} roles={roles} />

        <BottomBar
          saveLabel={isSubmitting ? "Сохранение..." : "Сохранить"}
          saveDisabled={isSubmitting}
          onBack={() => navigate({ to: "/users" })}
        />
      </form>
    </div>
  );
};
