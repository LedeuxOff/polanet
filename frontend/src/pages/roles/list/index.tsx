import { useNavigate } from "@tanstack/react-router";
import { ShieldCheckIcon } from "lucide-react";
import { BottomBar } from "@/components/bottom-bar";
import { ListPageHead } from "@/components/data-list";
import { useRolesListPage } from "./hooks";
import { RolesTable } from "./ui/roles-table";
import { roleTone } from "../ui/role-parts";

export const RolesPage = () => {
  const navigate = useNavigate();
  const { roles, isLoading, canCreate } = useRolesListPage();

  return (
    <div className="flex flex-col gap-4">
      <ListPageHead
        icon={<ShieldCheckIcon />}
        iconClassName={roleTone}
        title="Роли"
        description="Роли сотрудников и их права доступа"
      />

      <RolesTable
        roles={roles}
        isLoading={isLoading}
        onOpen={(role) =>
          navigate({ to: "/roles/$roleId", params: { roleId: role.id.toString() } })
        }
      />

      <BottomBar
        hideSaveButton={!canCreate}
        onCreate={canCreate ? () => navigate({ to: "/roles/new" }) : undefined}
      />
    </div>
  );
};
