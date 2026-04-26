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
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientInput {
  type: "individual" | "legal";
  lastName?: string;
  firstName?: string;
  middleName?: string;
  organizationName?: string;
  phone?: string;
  email?: string;
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
