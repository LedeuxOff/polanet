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
  password: string;
  roleId: number;
}

export const userSchema = z.object({
  lastName: z.string().min(1, "Фамилия обязательна").optional(),
  firstName: z.string().min(1, "Имя обязательно").optional(),
  middleName: z.string().optional(),
  birthDate: z.string().optional(),
  email: z.string().email("Неверный формат email").optional(),
  phone: z.string().optional(),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов").optional(),
  roleId: z.coerce.number().int().positive("Роль обязательна").optional(),
});

export type UserForm = z.infer<typeof userSchema>;
