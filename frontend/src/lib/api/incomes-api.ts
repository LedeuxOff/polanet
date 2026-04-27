import { request } from ".";
import { CreateIncomeInput, Income, UpdateIncomeInput } from "../types/delivery-types";

export const incomesApi = {
  list: (orderId?: number) =>
    request<Income[]>(orderId ? `/incomes?orderId=${orderId}` : "/incomes"),
  get: (id: number) => request<Income>(`/incomes/${id}`),
  create: (data: CreateIncomeInput) =>
    request<Income>("/incomes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: UpdateIncomeInput) =>
    request<Income>(`/incomes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request(`/incomes/${id}`, { method: "DELETE" }),
};
