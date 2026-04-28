import { request } from "./index";

export interface Permission {
  id: number;
  code: string;
  name: string;
  module: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface RolePermissions {
  roleId: number;
  permissions: string[];
}

export const permissionsApi = {
  // Получить все доступные права
  getAll: () => request<Permission[]>("/permissions"),

  // Получить права роли
  getRolePermissions: (roleId: number) => request<RolePermissions>(`/permissions/role/${roleId}`),

  // Назначить права роли
  setRolePermissions: (roleId: number, permissionCodes: string[]) =>
    request<{ message: string }>(`/permissions/role/${roleId}`, {
      method: "POST",
      body: JSON.stringify({ permissionCodes }),
    }),

  // Проверить наличие права
  checkPermission: (roleId: number, permissionCode: string) =>
    request<{ hasPermission: boolean }>("/permissions/check", {
      method: "POST",
      body: JSON.stringify({ roleId, permissionCode }),
    }),
};
