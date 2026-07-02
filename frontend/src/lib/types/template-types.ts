import z from "zod";

export interface Template {
  id: number;
  type: "delivery" | "pickup";
  address: string;
  payerLastName: string;
  payerFirstName: string;
  payerMiddleName: string | null;
  payerPhone: string | null;
  receiverLastName: string;
  receiverFirstName: string;
  receiverMiddleName: string | null;
  receiverPhone: string | null;
  date: string;
  volume: number | null;
  hasPass: boolean;
  addressComment: string | null;
  clientId: number | null;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  // Вычисляемые поля
  clientName?: string | null;
}

export interface CreateTemplateInput {
  type: "delivery" | "pickup";
  address: string;
  payerLastName: string;
  payerFirstName: string;
  payerMiddleName?: string;
  payerPhone?: string;
  receiverLastName: string;
  receiverFirstName: string;
  receiverMiddleName?: string;
  receiverPhone?: string;
  date: string;
  volume?: number | null;
  hasPass?: boolean;
  addressComment?: string;
  clientId?: number | null;
}

export const templateSchema = z.object({
  type: z.enum(["delivery", "pickup"]),
  address: z.string().min(1, "Адрес обязателен"),
  payerLastName: z.string().min(1, "Фамилия плательщика обязательна"),
  payerFirstName: z.string().min(1, "Имя плательщика обязательно"),
  payerMiddleName: z.string().optional(),
  payerPhone: z.string().optional(),
  receiverLastName: z.string().min(1, "Фамилия приемщика обязательна"),
  receiverFirstName: z.string().min(1, "Имя приемщика обязательно"),
  receiverMiddleName: z.string().optional(),
  receiverPhone: z.string().optional(),
  date: z.string().min(1, "Дата обязательна"),
  volume: z.number().optional().nullable(),
  hasPass: z.boolean().default(false),
  addressComment: z.string().optional(),
  clientId: z.coerce.number().optional().nullable(),
});

export type TemplateForm = z.infer<typeof templateSchema>;
