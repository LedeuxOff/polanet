import { request } from ".";
import type { ScreedClient, ScreedClientInput } from "../types";
import type { PaginationParams, PaginationResponse } from "./users-api";

export const screedClientsApi = {
  list: (query?: PaginationParams) => {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.search) params.set("search", query.search);
    const qs = params.toString();
    return request<PaginationResponse<ScreedClient[]>>(`/screed-clients${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => request<ScreedClient>(`/screed-clients/${id}`),
  create: (data: ScreedClientInput) =>
    request<ScreedClient>("/screed-clients", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: ScreedClientInput) =>
    request<ScreedClient>(`/screed-clients/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => request(`/screed-clients/${id}`, { method: "DELETE" }),
};
