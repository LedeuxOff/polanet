import { request } from ".";
import { Client, CreateClientInput } from "../types";
import { PaginationParams, PaginationResponse } from "./users-api";

export interface ClientsListQuery extends PaginationParams {
  type?: string;
}

export const clientsApi = {
  list: (query?: ClientsListQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.search) params.set("search", query.search);
    if (query?.type) params.set("type", query.type);
    const queryString = params.toString();
    return request<PaginationResponse<Client[]>>(`/clients${queryString ? `?${queryString}` : ""}`);
  },
  get: (id: number) => request<Client>(`/clients/${id}`),
  create: (data: CreateClientInput) =>
    request<Client>("/clients", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<CreateClientInput>) =>
    request<Client>(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request(`/clients/${id}`, { method: "DELETE" }),
};
