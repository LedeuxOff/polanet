import { useNavigate } from "@tanstack/react-router";
import { UserRoundPlusIcon } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DetailPageHead } from "@/components/data-list";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import type { UserForm } from "@/lib/types";
import { FormBuilder } from "@/widgets/form-builder";
import { useNewDeveloperPage } from "./hooks";
import { getDeveloperSections } from "../ui";

export const NewDeveloperPage = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { showToast } = useToast();
  const { form, onSubmit, isSubmitting } = useNewDeveloperPage();

  if (isPermissionsLoading) return <PermissionsLoader />;
  if (!hasPermission("users:create")) return <NoAccessScreen />;

  const handleSubmit = form.handleSubmit(async (data) => {
    const result = await onSubmit(data);
    if (result.success) {
      showToast("Разработчик успешно создан", "success");
      navigate({ to: "/developers" });
    } else if (result.error) {
      showToast(result.error, "error");
    }
  });

  return (
    <div className="flex flex-col gap-4">
      <DetailPageHead
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Разработчики", active: false, href: "/developers" },
              { label: "Создание", active: true },
            ]}
          />
        }
        icon={<UserRoundPlusIcon />}
        iconClassName="bg-slate-900 text-white dark:bg-white dark:text-slate-900"
        title="Новый разработчик"
      />

      <FormBuilder
        form={form}
        sections={getDeveloperSections<UserForm>(isSubmitting)}
        actions={{
          submit: { onSubmit: handleSubmit, isSubmitting, disabled: isSubmitting },
          back: () => navigate({ to: "/developers" }),
        }}
      />
    </div>
  );
};
