import { useNavigate, useParams } from "@tanstack/react-router";
import { KeyRoundIcon, Loader2Icon, SaveIcon, ShieldCheckIcon } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BottomBar } from "@/components/bottom-bar";
import { barButton } from "@/components/bottom-bar/styles";
import {
  DetailPageHead,
  HeadChip,
  ListEmptyState,
  Shimmer,
  listCardClass,
} from "@/components/data-list";
import { cn } from "@/lib/utils";
import { useRoleDetailPage } from "./hooks";
import { RoleCodeBadge, RoleMainInfo, roleTone } from "../ui/role-parts";
import { RolePermissions } from "./ui/role-permissions";

export const EditRolePage = () => {
  const { roleId: roleIdStr } = useParams({ from: "/roles/$roleId" });
  const roleId = parseInt(roleIdStr);
  const navigate = useNavigate();
  const {
    isLoading,
    isDeleting,
    isSubmitting,
    isSavingPermissions,
    role,
    permissions,
    rolePermissions,
    permissionsByModule,
    moduleNames,
    form,
    onSubmit,
    savePermissions,
    handleDelete,
    togglePermission,
    toggleModulePermissions,
    canDelete,
  } = useRoleDetailPage(roleId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className={cn(listCardClass, "flex items-center gap-4 p-6")}>
          <Shimmer className="h-14 w-14 rounded-[20px]" />
          <div className="flex flex-1 flex-col gap-2">
            <Shimmer className="h-6 w-48" />
            <Shimmer className="h-4 w-24" />
          </div>
        </div>
        <Shimmer className="h-40 w-full rounded-3xl" />
        <Shimmer className="h-72 w-full rounded-3xl" />
      </div>
    );
  }

  if (!role) {
    return <ListEmptyState title="Роль не найдена" text="Возможно, она была удалена" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <DetailPageHead
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Роли", active: false, href: "/roles" },
              { label: role.name, active: true },
            ]}
          />
        }
        icon={<ShieldCheckIcon />}
        iconClassName={roleTone}
        title={role.name}
        badges={<RoleCodeBadge code={role.code} />}
        chips={
          <HeadChip icon={<KeyRoundIcon />}>
            Прав: {rolePermissions.length} из {permissions.length}
          </HeadChip>
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <RoleMainInfo form={form} disabled={isSubmitting} />

        <RolePermissions
          permissionsByModule={permissionsByModule}
          moduleNames={moduleNames}
          rolePermissions={rolePermissions}
          togglePermission={togglePermission}
          toggleModulePermissions={toggleModulePermissions}
        />

        <BottomBar
          isSumitting={isSubmitting}
          saveLabel={isSubmitting ? "Сохранение..." : "Сохранить"}
          onBack={() => navigate({ to: "/roles" })}
          showDeleteButton={canDelete}
          handleDelete={handleDelete}
          isDeleting={isDeleting || isSubmitting}
          extraRow={
            <button
              type="button"
              onClick={() => savePermissions(rolePermissions)}
              disabled={isSavingPermissions || isSubmitting}
              className={cn(
                barButton.secondary,
                "w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-200 dark:hover:bg-emerald-500/30",
              )}
            >
              {isSavingPermissions ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
              {isSavingPermissions ? "Сохранение прав..." : "Сохранить права"}
            </button>
          }
        />
      </form>
    </div>
  );
};
