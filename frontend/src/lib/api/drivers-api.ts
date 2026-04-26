import { request } from ".";
import { CreateDriverInput, Driver } from "../types";

export const driversApi = {
  list: () => request<Driver[]>("/drivers"),
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