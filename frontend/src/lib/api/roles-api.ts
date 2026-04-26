import { request } from ".";
import { Role } from "../types/role-types";

export const rolesApi = {
  list: () => request<Role[]>("/roles"),
  get: (id: number) => request<Role>(`/roles/${id}`),
  create: (data: { code: string; name: string }) =>
    request<Role>("/roles", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { code?: string; name?: string }) =>
    request<Role>(`/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request(`/roles/${id}`, { method: "DELETE" }),
};
