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