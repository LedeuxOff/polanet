import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { rolesApi } from "@/lib/api/roles-api";
import { type Role } from "@/lib/types/role-types";
import { permissionsApi, type Permission } from "@/lib/api/permissions-api";
import { usePermissions } from "@/lib/contexts/permission-context";

export interface RoleForm {
  code: string;
  name: string;
}

export const useRoleDetailPage = (roleId: number) => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  // Form management
  const form = useForm<RoleForm>({
    defaultValues: {
      code: "",
      name: "",
    },
  });

  // Загрузить информацию о роли
  const loadRole = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await rolesApi.get(roleId);
      setRole(data);
      form.reset({
        code: data.code || "",
        name: data.name || "",
      });
    } catch (error) {
      console.error("Error loading role:", error);
    } finally {
      setIsLoading(false);
    }
  }, [roleId, form]);

  // Загрузить все доступные права
  const loadPermissions = useCallback(async () => {
    try {
      const allPermissions = await permissionsApi.getAll();
      setPermissions(allPermissions);
    } catch (error) {
      console.error("Error loading permissions:", error);
    }
  }, []);

  // Загрузить права роли
  const loadRolePermissions = useCallback(async () => {
    try {
      const data = await permissionsApi.getRolePermissions(roleId);
      setRolePermissions(data.permissions);
    } catch (error) {
      console.error("Error loading role permissions:", error);
    }
  }, [roleId]);

  // Сохранить основную информацию о роли
  const onSubmit = async (data: RoleForm) => {
    setIsSubmitting(true);
    try {
      await rolesApi.update(roleId, data);
      await loadRole();
      alert("Роль успешно обновлена");
      navigate({ to: "/roles" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ошибка при обновлении роли";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Сохранить права роли
  const savePermissions = async (selectedPermissions: string[]) => {
    setIsSavingPermissions(true);
    try {
      await permissionsApi.setRolePermissions(roleId, selectedPermissions);
      setRolePermissions(selectedPermissions);
      alert("Права успешно сохранены");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ошибка при сохранении прав";
      alert(message);
    } finally {
      setIsSavingPermissions(false);
    }
  };

  // Удалить роль
  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить эту роль?")) return;

    setIsDeleting(true);
    try {
      await rolesApi.delete(roleId);
      navigate({ to: "/roles" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ошибка при удалении роли";
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Переключить право
  const togglePermission = (permissionCode: string) => {
    setRolePermissions((prev) =>
      prev.includes(permissionCode)
        ? prev.filter((code) => code !== permissionCode)
        : [...prev, permissionCode],
    );
  };

  // Выбрать/снять все права для модуля
  const toggleModulePermissions = (modulePermissions: Permission[]) => {
    const allSelected = modulePermissions.every((p) => rolePermissions.includes(p.code));
    if (allSelected) {
      // Снять все права модуля
      setRolePermissions((prev) =>
        prev.filter((code) => !modulePermissions.some((p) => p.code === code)),
      );
    } else {
      // Выбрать все права модуля
      const newPermissions = [...rolePermissions];
      modulePermissions.forEach((p) => {
        if (!newPermissions.includes(p.code)) {
          newPermissions.push(p.code);
        }
      });
      setRolePermissions(newPermissions);
    }
  };

  useEffect(() => {
    loadRole();
    loadPermissions();
    loadRolePermissions();
  }, [loadRole, loadPermissions, loadRolePermissions]);

  // Группировать права по модулям
  const permissionsByModule = permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>,
  );

  const moduleNames: Record<string, string> = {
    users: "Пользователи",
    roles: "Роли",
    orders: "Заявки",
    clients: "Клиенты",
    cars: "Автомобили",
    drivers: "Водители",
    "transport-cards": "Транспортные карты",
    deliveries: "Доставки",
    finances: "Финансы",
    backups: "Резервные копии",
    "system-info": "Информация о системе",
    "system-logs": "Системные логи",
  };

  const canDelete = hasPermission("roles:delete");

  return {
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
    loadRole,
    canDelete,
  };
};
