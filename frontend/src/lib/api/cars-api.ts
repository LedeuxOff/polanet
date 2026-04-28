import { request } from ".";
import { Car, CreateCarInput } from "../types";

export const carsApi = {
  list: () => request<Car[]>("/cars"),
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
