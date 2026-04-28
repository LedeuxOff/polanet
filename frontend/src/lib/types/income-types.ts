import z from "zod";

export const incomeSchema = z.object({
  amount: z.coerce.number().int().positive("Сумма должна быть положительной"),
});

export type IncomeForm = z.infer<typeof incomeSchema>;
