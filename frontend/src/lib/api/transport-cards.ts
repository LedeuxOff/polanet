import { request } from ".";
import { CreateTransportCardExpenseInput, CreateTransportCardInput, TransportCard, TransportCardExpense, TransportCardHistory } from "../types";

export const transportCardsApi = {
    list: () =>
      request<
        (TransportCard & {
          expenses: TransportCardExpense[];
          totalExpenses: number;
        })[]
      >("/transport-cards"),
    get: (id: number) =>
      request<
        TransportCard & {
          expenses: TransportCardExpense[];
          totalExpenses: number;
          history: TransportCardHistory[];
        }
      >(`/transport-cards/${id}`),
    create: (data: CreateTransportCardInput) =>
      request<TransportCard>("/transport-cards", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<CreateTransportCardInput>) =>
      request<TransportCard>(`/transport-cards/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request(`/transport-cards/${id}`, { method: "DELETE" }),
    // Расходы
    addExpense: (cardId: number, data: CreateTransportCardExpenseInput) =>
      request<TransportCardExpense>(`/transport-cards/${cardId}/expenses`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    removeExpense: (cardId: number, expenseId: number) =>
      request(`/transport-cards/${cardId}/expenses/${expenseId}`, {
        method: "DELETE",
      }),
  };