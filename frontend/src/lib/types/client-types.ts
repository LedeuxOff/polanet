import z from "zod";

export interface Client {
  id: number;
  type: "individual" | "legal";
  lastName: string | null;
  firstName: string | null;
  middleName: string | null;
  organizationName: string | null;
  phone: string | null;
  email: string | null;
  payerLastName: string | null;
  payerFirstName: string | null;
  payerMiddleName: string | null;
  payerPhone: string | null;
  receiverLastName: string | null;
  receiverFirstName: string | null;
  receiverMiddleName: string | null;
  receiverPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInfo {
  lastName?: string;
  firstName?: string;
  middleName?: string;
  phone?: string;
}

export interface CreateClientInput {
  type: "individual" | "legal";
  lastName?: string;
  firstName?: string;
  middleName?: string;
  organizationName?: string;
  phone?: string;
  email?: string;
  payer?: ContactInfo;
  receiver?: ContactInfo;
}

export const clientSchema = z
  .object({
    type: z.enum(["individual", "legal"]).optional(),
    // Для физического лица
    lastName: z.string().min(1, "Фамилия обязательна").optional(),
    firstName: z.string().min(1, "Имя обязательно").optional(),
    middleName: z.string().optional(),
    // Для юридического лица
    organizationName: z.string().min(1, "Название организации обязательно").optional(),
    // Общие поля
    phone: z.string().optional(),
    email: z.string().email("Неверный формат email").optional(),
    // Плательщик
    payerLastName: z.string().optional(),
    payerFirstName: z.string().optional(),
    payerMiddleName: z.string().optional(),
    payerPhone: z.string().optional(),
    // Приемщик
    receiverLastName: z.string().optional(),
    receiverFirstName: z.string().optional(),
    receiverMiddleName: z.string().optional(),
    receiverPhone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // На странице редактирования проверяем только если тип individual и поля пустые
    if (data.type === "individual") {
      if (data.lastName === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Фамилия обязательна для физического лица",
          path: ["lastName"],
        });
      }
      if (data.firstName === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Имя обязательно для физического лица",
          path: ["firstName"],
        });
      }
    } else if (data.type === "legal") {
      if (data.organizationName === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Название организации обязательно для юридического лица",
          path: ["organizationName"],
        });
      }
    }
  });

export type ClientForm = z.infer<typeof clientSchema>;

export const newClientSchema = z
  .object({
    type: z.enum(["individual", "legal"]),
    // Для физического лица
    lastName: z.string().min(1, "Фамилия обязательна").optional(),
    firstName: z.string().min(1, "Имя обязательно").optional(),
    middleName: z.string().optional(),
    // Для юридического лица
    organizationName: z.string().min(1, "Название организации обязательно").optional(),
    // Общие поля
    phone: z.string().optional(),
    email: z.string().email("Неверный формат email").optional(),
    // Плательщик
    payer: z
      .object({
        lastName: z.string().optional(),
        firstName: z.string().optional(),
        middleName: z.string().optional(),
        phone: z.string().optional(),
      })
      .optional(),
    // Приемщик
    receiver: z
      .object({
        lastName: z.string().optional(),
        firstName: z.string().optional(),
        middleName: z.string().optional(),
        phone: z.string().optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "individual") {
      if (!data.lastName || data.lastName.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Фамилия обязательна для физического лица",
          path: ["lastName"],
        });
      }
      if (!data.firstName || data.firstName.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Имя обязательно для физического лица",
          path: ["firstName"],
        });
      }
    } else if (data.type === "legal") {
      if (!data.organizationName || data.organizationName.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Название организации обязательно для юридического лица",
          path: ["organizationName"],
        });
      }
    }
  });

export type NewClientForm = z.infer<typeof newClientSchema>;
