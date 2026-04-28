import { request } from ".";
import { CreateOrderInput, Order, OrderHistory } from "../types/order-types";
import { CreatePaymentInput, Payment } from "../types/payment-types";

export interface OrdersListQuery {
  id?: string;
  status?: string;
  customerDebt?: string;
  companyDebt?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const ordersApi = {
  list: (query?: OrdersListQuery) => {
    const params = new URLSearchParams();
    if (query?.id) params.set("id", query.id);
    if (query?.status) params.set("status", query.status);
    if (query?.customerDebt) params.set("customerDebt", query.customerDebt);
    if (query?.companyDebt) params.set("companyDebt", query.companyDebt);
    if (query?.dateFrom) params.set("dateFrom", query.dateFrom);
    if (query?.dateTo) params.set("dateTo", query.dateTo);
    const queryString = params.toString();
    return request<
      (Order & {
        payments: Payment[];
        receivedAmount: number;
        pendingAmount: number;
        customerDebt: number;
        companyDebt: number;
      })[]
    >(`/orders${queryString ? `?${queryString}` : ""}`);
  },
  get: (id: number) =>
    request<
      Order & {
        payments: Payment[];
        receivedAmount: number;
        pendingAmount: number;
        customerDebt: number;
        companyDebt: number;
        history: OrderHistory[];
      }
    >(`/orders/${id}`),
  create: (data: CreateOrderInput) =>
    request<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  quickCreate: (data: { clientId: number }) =>
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
