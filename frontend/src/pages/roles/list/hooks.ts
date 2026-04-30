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

  const canCreate = hasPermission("roles:create");

  return {
    roles,
    isLoading,
    canCreate,
  };
};
