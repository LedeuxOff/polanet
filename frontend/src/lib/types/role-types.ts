import z from "zod";

export interface Role {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const roleSchema = z.object({
  code: z.string().min(1, "Код роли обязателен").max(50).optional(),
  name: z.string().min(1, "Название роли обязательно").max(100).optional(),
});

export type RoleForm = z.infer<typeof roleSchema>;

export const newRoleSchema = z.object({
  code: z.string().min(1, "Код роли обязателен").max(50),
  name: z.string().min(1, "Название роли обязательно").max(100),
});

export type NewRoleForm = z.infer<typeof newRoleSchema>;
