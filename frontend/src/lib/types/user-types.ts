import z from "zod";

export interface User {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string | null;
  birthDate: string | null;
  email: string;
  phone: string | null;
  roleId: number;
  roleCode?: string;
  roleName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  token: string;
  user: {
    id: number;
    email: string;
    lastName: string;
    firstName: string;
    middleName: string | null;
    roleId: number;
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  lastName: string;
  firstName: string;
  middleName?: string;
  birthDate?: string;
  email: string;
  phone?: string;
  roleId: number;
}

export const userSchema = z
  .object({
    lastName: z.string().min(1, "Фамилия обязательна"),
    firstName: z.string().min(1, "Имя обязательно"),
    middleName: z.string().optional(),
    birthDate: z.string().optional(),
    email: z.string().email("Неверный формат email"),
    phone: z.string().optional(),
    roleId: z.coerce.number().int().positive("Роль обязательна"),
  })
  .transform((data) => ({
    lastName: data.lastName || "",
    firstName: data.firstName || "",
    middleName: data.middleName || undefined,
    birthDate: data.birthDate || undefined,
    email: data.email || "",
    phone: data.phone || undefined,
    roleId: data.roleId,
  }));

export type UserForm = z.infer<typeof userSchema>;
