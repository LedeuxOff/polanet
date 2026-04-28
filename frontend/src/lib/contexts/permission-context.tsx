import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { permissionsApi } from "@/lib/api/permissions-api";
import { useAuth } from "./auth-context";

interface PermissionContextType {
  rolePermissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isLoading: boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const loadPermissions = useCallback(async (roleId: number) => {
    try {
      const data = await permissionsApi.getRolePermissions(roleId);
      setRolePermissions(data.permissions);
    } catch (error) {
      console.error("Error loading permissions:", error);
      setRolePermissions([]);
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  }, []);

  // Отслеживаем загрузку permissions отдельно
  const [hasLoadedPermissions, setHasLoadedPermissions] = useState(false);

  useEffect(() => {
    if (user?.roleId && !hasLoadedPermissions) {
      setHasLoadedPermissions(true);
      loadPermissions(user.roleId);
    } else if (!isAuthLoading && !user) {
      // Пользователь не авторизован
      setRolePermissions([]);
      setIsLoading(false);
      setInitialized(true);
    }
  }, [user, isAuthLoading, loadPermissions, hasLoadedPermissions]);

  const hasPermission = useCallback(
    (permission: string) => {
      // Если загружено и есть звездочка - все разрешено
      if (rolePermissions.includes("*")) {
        return true;
      }
      return rolePermissions.includes(permission);
    },
    [rolePermissions],
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]) => {
      if (rolePermissions.includes("*")) {
        return true;
      }
      return permissions.some((p) => rolePermissions.includes(p));
    },
    [rolePermissions],
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]) => {
      if (rolePermissions.includes("*")) {
        return true;
      }
      return permissions.every((p) => rolePermissions.includes(p));
    },
    [rolePermissions],
  );

  const refreshPermissions = useCallback(async () => {
    if (user?.roleId) {
      setIsLoading(true);
      await loadPermissions(user.roleId);
    }
  }, [loadPermissions, user]);

  // Всегда рендерим контекст провайдера, даже во время начальной инициализации
  return (
    <PermissionContext.Provider
      value={{
        rolePermissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isLoading,
        refreshPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
};

// Hook for route guards
export const usePermissionGuard = (requiredPermission: string) => {
  const { hasPermission, isLoading } = usePermissions();
  return {
    canAccess: hasPermission(requiredPermission),
    isLoading,
  };
};

export const useAnyPermissionGuard = (requiredPermissions: string[]) => {
  const { hasAnyPermission, isLoading } = usePermissions();
  return {
    canAccess: hasAnyPermission(requiredPermissions),
    isLoading,
  };
};
