import { request } from ".";
import {
  CreateDeliveryInput,
  Delivery,
  DeliveryWithIncome,
  UpdateDeliveryInput,
} from "../types/delivery-types";

export const deliveriesApi = {
  list: (orderId: number) => request<DeliveryWithIncome[]>(`/deliveries/order/${orderId}`),
  get: (id: number) => request<DeliveryWithIncome>(`/deliveries/${id}`),
  create: (data: CreateDeliveryInput) =>
    request<Delivery>("/deliveries", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: UpdateDeliveryInput) =>
    request<Delivery>(`/deliveries/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request(`/deliveries/${id}`, { method: "DELETE" }),
  complete: (id: number) =>
    request<Delivery>(`/deliveries/${id}/complete`, {
      method: "POST",
    }),
};
