import { request } from ".";
import { Car, CreateCarInput } from "../types";
import { PaginationParams, PaginationResponse } from "./users-api";

export interface CarsListQuery extends PaginationParams {
  brand?: string;
  licensePlate?: string;
}

export const carsApi = {
  list: (query?: CarsListQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.brand) params.set("brand", query.brand);
    if (query?.licensePlate) params.set("licensePlate", query.licensePlate);
    const queryString = params.toString();
    return request<PaginationResponse<Car[]>>(`/cars${queryString ? `?${queryString}` : ""}`);
  },
  get: (id: number) => request<Car>(`/cars/${id}`),
  create: (data: CreateCarInput) =>
    request<Car>("/cars", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<CreateCarInput>) =>
    request<Car>(`/cars/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request(`/cars/${id}`, { method: "DELETE" }),
};
