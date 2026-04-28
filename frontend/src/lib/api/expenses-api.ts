import { request } from ".";
import { CreateExpenseInput, Expense, UpdateExpenseInput } from "../types";

export interface ExpensesListQuery {
  id?: number;
  expenseType?: string;
  paymentType?: string;
  transportCardId?: number;
  driverId?: number;
}

export const expensesApi = {
  list: (query?: ExpensesListQuery) => {
    const params = new URLSearchParams();
    if (query?.id) params.append("id", String(query.id));
    if (query?.expenseType) params.append("expenseType", query.expenseType);
    if (query?.paymentType) params.append("paymentType", query.paymentType);
    if (query?.transportCardId) params.append("transportCardId", String(query.transportCardId));
    if (query?.driverId) params.append("driverId", String(query.driverId));
    return request<Expense[]>(params.toString() ? `/expenses?${params}` : "/expenses");
  },
  get: (id: number) => request<Expense>(`/expenses/${id}`),
  create: (data: CreateExpenseInput) =>
    request<Expense>("/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: UpdateExpenseInput) =>
    request<Expense>(`/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request(`/expenses/${id}`, { method: "DELETE" }),
};
