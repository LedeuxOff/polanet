import { request } from ".";
import { CreateDriverInput, Driver } from "../types";
import { PaginationParams, PaginationResponse } from "./users-api";

export interface DriversListQuery extends PaginationParams {
  search?: string;
}

export const driversApi = {
  list: (query?: DriversListQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.search) params.set("search", query.search);
    const queryString = params.toString();
    return request<PaginationResponse<Driver[]>>(`/drivers${queryString ? `?${queryString}` : ""}`);
  },
  get: (id: number) => request<Driver>(`/drivers/${id}`),
  create: (data: CreateDriverInput) =>
    request<Driver>("/drivers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<CreateDriverInput>) =>
    request<Driver>(`/drivers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request(`/drivers/${id}`, { method: "DELETE" }),
};
