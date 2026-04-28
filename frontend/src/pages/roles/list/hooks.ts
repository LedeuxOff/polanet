import { rolesApi } from "@/lib/api/roles-api";
import { Role } from "@/lib/types";
import { useEffect, useState } from "react";
import { usePermissions } from "@/lib/contexts/permission-context";

export const useRolesListPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = usePermissions();

  const loadRoles = async () => {
    try {
      const data = await rolesApi.list();
      setRoles(data);
    } catch (error) {
      console.error("Ошибка загрузки ролей:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту роль?")) {
      return;
    }

    try {
      await rolesApi.delete(id);
      setRoles(roles.filter((r) => r.id !== id));
    } catch (error) {
      alert("Ошибка при удалении: " + (error as Error).message);
    }
  };

  const canCreate = hasPermission("roles:create");
  const canDelete = hasPermission("roles:delete");

  return {
    roles,
    isLoading,
    handleDelete,
    canCreate,
    canDelete,
  };
};
