import z from "zod";

export type ExpenseType = "salary" | "fuel";
export type ExpensePaymentType = "cash" | "bank_transfer";

export interface ExpenseTransportCard {
  id: number;
  cardNumber: string;
}

export interface ExpenseDriver {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string;
}

export interface Expense {
  id: number;
  expenseType: ExpenseType;
  paymentType: ExpensePaymentType;
  transportCardId: number | null;
  driverId: number | null;
  dateTime: string;
  amount: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  transportCard?: ExpenseTransportCard | null;
  driver?: ExpenseDriver | null;
}

export interface CreateExpenseInput {
  expenseType: ExpenseType;
  paymentType: ExpensePaymentType;
  transportCardId?: number | null;
  driverId?: number | null;
  dateTime: string;
  amount: number;
  comment?: string | null;
}

export interface UpdateExpenseInput {
  expenseType?: ExpenseType;
  paymentType?: ExpensePaymentType;
  transportCardId?: number | null;
  driverId?: number | null;
  dateTime?: string;
  amount?: number;
  comment?: string | null;
}

export const expenseSchema = z.object({
  expenseType: z.enum(["salary", "fuel"]),
  paymentType: z.enum(["cash", "bank_transfer"]),
  transportCardId: z.number().nullable().optional(),
  driverId: z.number().nullable().optional(),
  dateTime: z.string().min(1, "Укажите дату и время"),
  amount: z.coerce.number().positive("Сумма должна быть больше нуля"),
  comment: z.string().optional().nullable(),
});

export type ExpenseForm = z.infer<typeof expenseSchema>;
