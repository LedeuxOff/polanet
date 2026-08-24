import { request } from "./index";
import type { Template, CreateTemplateInput } from "@/lib/types/template-types";

export const templatesApi = {
  list: () =>
    request<Template[]>("/templates", {
      method: "GET",
    }),
  delete: (id: number) =>
    request<void>(`/templates/${id}`, {
      method: "DELETE",
    }),
  saveFromOrder: (orderId: number, data: CreateTemplateInput) =>
    request<Template>(`/templates/from-order/${orderId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
