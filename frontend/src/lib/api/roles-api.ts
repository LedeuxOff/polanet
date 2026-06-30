import { request } from ".";
import { Role } from "../types";

export interface RolesListQuery {
  page?: number;
  limit?: number;
}

export interface RolesListResponse {
  data: Role[];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
}

export const rolesApi = {
  list: (params?: RolesListQuery) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    const query = queryParams.toString();
    const url = query ? `/roles?${query}` : "/roles";
    return request<RolesListResponse>(url);
  },
  // Получить все роли без пагинации (для фильтров)
  listAll: () => {
    return request<Role[]>("/roles");
  },
  get: (id: number) => request<Role>(`/roles/${id}`),
  create: (data: { name: string; permissions: string[] }) =>
    request<Role>("/roles", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { name: string; permissions: string[] }) =>
    request<Role>(`/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request(`/roles/${id}`, { method: "DELETE" }),
};
