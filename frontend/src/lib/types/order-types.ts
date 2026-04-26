import { Payment } from "./payment-types";

export interface Order {
  id: number;
  type: "delivery" | "pickup";
  address: string;
  cost: number;
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
  paymentType: "cash" | "bank_transfer";
  clientId: number | null;
  createdById: number | null;
  createdAt: string;
  updatedAt: string;
  // Вычисляемые поля
  payments?: Payment[];
  received?: number;
  completed?: number;
  customerDebt?: number;
  companyDebt?: number;
  isPaid?: boolean;
  paymentStatus?: "unpaid" | "paid" | "partial";
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
  cost: number;
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
  paymentType: "cash" | "bank_transfer";
  clientId?: number | null;
}
