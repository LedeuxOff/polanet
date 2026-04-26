import { request } from ".";
import { CreateDeliveryInput, Delivery } from "../types/delivery-types";

export const deliveriesApi = {
  list: (orderId: number) => request<Delivery[]>(`/deliveries/order/${orderId}`),
  get: (id: number) => request<Delivery>(`/deliveries/${id}`),
  create: (data: CreateDeliveryInput) =>
    request<Delivery>("/deliveries", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<CreateDeliveryInput>) =>
    request<Delivery>(`/deliveries/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request(`/deliveries/${id}`, { method: "DELETE" }),
  pay: (id: number) =>
    request<Delivery>(`/deliveries/${id}/pay`, {
      method: "POST",
    }),
};
