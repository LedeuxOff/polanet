import z from "zod";
import { Driver } from "./driver-types";

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

export interface TransportCardExpense {
  id: number;
  cardId: number;
  amount: number;
  paymentDate: string;
  createdAt: string;
}

export interface TransportCard {
  id: number;
  cardNumber: string;
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
  driverId?: number | null;
}

export interface CreateTransportCardExpenseInput {
  cardId: number;
  amount: number;
  paymentDate: string;
}

export const transportCardSchema = z.object({
  cardNumber: z.string().min(1, "Номер карты обязателен").optional(),
  driverId: z.coerce.number().optional().nullable(),
});

export type TransportCardForm = z.infer<typeof transportCardSchema>;

export const newTransportCardSchema = z.object({
  cardNumber: z.string().min(1, "Номер карты обязателен"),
  driverId: z.coerce.number().optional().nullable(),
});

export type NewTransportCardForm = z.infer<typeof newTransportCardSchema>;
