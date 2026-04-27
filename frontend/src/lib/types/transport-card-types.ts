import z from "zod";
import { Driver } from "./driver-types";
import { Expense } from "./expense-types";

export interface TransportCardHistory {
  id: number;
  cardId: number;
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

// Переименование для совместимости
export type TransportCardExpense = Expense;

export type TransportCardStatus = "active" | "inactive";

export interface TransportCard {
  id: number;
  cardNumber: string;
  status: TransportCardStatus;
  driverId: number | null;
  driver?: Driver | null;
  createdAt: string;
  updatedAt: string;
  expenses?: TransportCardExpense[];
  totalExpenses?: number;
  history?: TransportCardHistory[];
}

export interface CreateTransportCardInput {
  cardNumber: string;
  status?: TransportCardStatus;
  driverId?: number | null;
}

export interface CreateTransportCardExpenseInput {
  cardId: number;
  amount: number;
  paymentDate: string;
}

export const transportCardSchema = z.object({
  cardNumber: z.string().min(1, "Номер карты обязателен").optional(),
  status: z.enum(["active", "inactive"]).optional(),
  driverId: z.coerce.number().optional().nullable(),
});

export type TransportCardForm = z.infer<typeof transportCardSchema>;

export const newTransportCardSchema = z.object({
  cardNumber: z.string().min(1, "Номер карты обязателен"),
  status: z.enum(["active", "inactive"]).default("active"),
  driverId: z.coerce.number().optional().nullable(),
});

export type NewTransportCardForm = z.infer<typeof newTransportCardSchema>;
