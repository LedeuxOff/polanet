import { ReactNode } from "react";
import { usePermissions } from "@/lib/contexts/permission-context";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
}

export const PermissionGuard = ({ permission, children }: PermissionGuardProps) => {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Загрузка прав доступа...
        </CardContent>
      </Card>
    );
  }

  if (!hasPermission(permission)) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">У вас нет доступа к этой странице</p>
          <Link to="/">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Вернуться на главную
            </button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

interface AnyPermissionGuardProps {
  permissions: string[];
  children: ReactNode;
}

export const AnyPermissionGuard = ({ permissions, children }: AnyPermissionGuardProps) => {
  const { hasAnyPermission, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Загрузка прав доступа...
        </CardContent>
      </Card>
    );
  }

  if (!hasAnyPermission(permissions)) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">У вас нет доступа к этой странице</p>
          <Link to="/">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Вернуться на главную
            </button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};
