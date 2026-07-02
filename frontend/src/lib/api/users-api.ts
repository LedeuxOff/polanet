import { request } from ".";
import { RegisterInput, User } from "../types";

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  roleCode?: string;
}

export interface PaginationResponse<T> {
  data: T;
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
}

export const usersApi = {
  list: (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.search) queryParams.append("search", params.search);
    if (params?.roleCode) queryParams.append("roleCode", params.roleCode);
    const query = queryParams.toString();
    const url = query ? `/users?${query}` : "/users";
    return request<PaginationResponse<User[]>>(url);
  },
  get: (id: number) => request<User>(`/users/${id}`),
  create: (data: RegisterInput) =>
    request<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<RegisterInput>) =>
    request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request(`/users/${id}`, { method: "DELETE" }),
  sendPassword: (id: number) =>
    request<{ success: boolean; message: string }>(`/users/${id}/send-password`, {
      method: "POST",
    }),
  unbindTelegram: (id: number) =>
    request<{ success: boolean; message: string }>(`/users/${id}/unbind-telegram`, {
      method: "POST",
    }),
};
