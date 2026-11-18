import { request } from ".";
import type { Work, WorkInput } from "../types";
import type { PaginationResponse } from "./users-api";

export interface WorksListQuery {
  clientId?: number;
  page?: number;
  limit?: number;
}

export const worksApi = {
  /** Работы за период (включительно), даты в формате YYYY-MM-DD */
  calendar: (startDate: string, endDate: string) =>
    request<Work[]>(`/works/calendar?startDate=${startDate}&endDate=${endDate}`),
  list: (query?: WorksListQuery) => {
    const params = new URLSearchParams();
    if (query?.clientId) params.set("clientId", String(query.clientId));
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    const qs = params.toString();
    return request<PaginationResponse<Work[]>>(`/works${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => request<Work>(`/works/${id}`),
  create: (data: WorkInput) =>
    request<Work>("/works", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<WorkInput>) =>
    request<Work>(`/works/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/works/${id}`, { method: "DELETE" }),
};
