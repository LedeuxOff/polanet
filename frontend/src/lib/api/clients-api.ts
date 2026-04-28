import { request } from ".";
import { Client, CreateClientInput } from "../types";

export const clientsApi = {
  list: () => request<Client[]>("/clients"),
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
