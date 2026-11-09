import { request } from ".";
import type { Worker, WorkerInput } from "../types";
import type { PaginationResponse } from "./users-api";

export interface WorkersListQuery {
  page?: number;
  limit?: number;
  search?: string;
  teamId?: number;
}

export const workersApi = {
  list: (query?: WorkersListQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.search) params.set("search", query.search);
    if (query?.teamId) params.set("teamId", String(query.teamId));
    const qs = params.toString();
    return request<PaginationResponse<Worker[]>>(`/workers${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => request<Worker>(`/workers/${id}`),
  create: (data: WorkerInput) =>
    request<Worker>("/workers", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<WorkerInput>) =>
    request<Worker>(`/workers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/workers/${id}`, { method: "DELETE" }),
};
