import z from "zod";
import { Payment } from "./payment-types";

export interface Order {
  id: number;
  type: "delivery" | "pickup";
  address: string;
  payerLastName: string;
  payerFirstName: string;
  payerMiddleName: string | null;
  receiverLastName: string;
  receiverFirstName: string;
  receiverMiddleName: string | null;
  dateTime: string;
  hasPass: boolean;
  addressComment: string | null;
  status: "new" | "in_progress" | "completed" | "cancelled" | "archived" | "draft";
  clientId: number | null;
  createdById: number | null;
  createdAt: string;
  updatedAt: string;
  // Вычисляемые поля (от сервера)
  receivedAmount?: number;
  pendingAmount?: number;
  customerDebt?: number;
  companyDebt?: number;
  history?: OrderHistory[];
}

export interface OrderHistory {
  id: number;
  orderId: number;
  userId: number;
  action: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  userLastName?: string;
  userFirstName?: string;
  userMiddleName?: string;
}

export interface CreateOrderInput {
  type: "delivery" | "pickup";
  address: string;
  payerLastName: string;
  payerFirstName: string;
  payerMiddleName?: string;
  receiverLastName: string;
  receiverFirstName: string;
  receiverMiddleName?: string;
  dateTime: string;
  hasPass?: boolean;
  addressComment?: string;
  status?: "new" | "in_progress" | "completed" | "cancelled" | "archived" | "draft";
  clientId?: number | null;
}

export const orderSchema = z.object({
  type: z.enum(["delivery", "pickup"]),
  address: z.string().min(1, "Адрес обязателен"),
  payerLastName: z.string().min(1, "Фамилия плательщика обязательна"),
  payerFirstName: z.string().min(1, "Имя плательщика обязательно"),
  payerMiddleName: z.string().optional(),
  receiverLastName: z.string().min(1, "Фамилия приемщика обязательна"),
  receiverFirstName: z.string().min(1, "Имя приемщика обязательно"),
  receiverMiddleName: z.string().optional(),
  dateTime: z.string().min(1, "Дата и время обязательны"),
  hasPass: z.boolean().default(false),
  addressComment: z.string().optional(),
  status: z.enum(["new", "in_progress", "completed", "cancelled", "archived", "draft"]),
  clientId: z.coerce.number().optional().nullable(),
});

export type OrderForm = z.infer<typeof orderSchema>;
