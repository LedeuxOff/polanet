import { request } from ".";
import { CreateOrderInput, Order, OrderHistory } from "../types/order-types";
import { CreatePaymentInput, Payment } from "../types/payment-types";

export const ordersApi = {
  list: () =>
    request<
      (Order & {
        payments: Payment[];
        received: number;
        completed: number;
        customerDebt: number;
        companyDebt: number;
        isPaid: boolean;
        paymentStatus: "unpaid" | "paid" | "partial";
      })[]
    >("/orders"),
  get: (id: number) =>
    request<
      Order & {
        payments: Payment[];
        received: number;
        completed: number;
        customerDebt: number;
        companyDebt: number;
        isPaid: boolean;
        paymentStatus: "unpaid" | "paid" | "partial";
        history: OrderHistory[];
      }
    >(`/orders/${id}`),
  create: (data: CreateOrderInput) =>
    request<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  quickCreate: (data: { clientId: number; cost: number }) =>
    request<Order>("/orders/quick", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<CreateOrderInput>) =>
    request<Order>(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request(`/orders/${id}`, { method: "DELETE" }),
  // Выплаты
  addPayment: (orderId: number, data: CreatePaymentInput) =>
    request<Payment>(`/orders/${orderId}/payments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  removePayment: (orderId: number, paymentId: number) =>
    request(`/orders/${orderId}/payments/${paymentId}`, { method: "DELETE" }),
  // История
  getHistory: (orderId: number) => request<OrderHistory[]>(`/orders/${orderId}/history`),
};
