import z from "zod";
import { TransportCard } from "./transport-card-types";

export interface Driver {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  transportCard?: TransportCard | null;
}

export interface CreateDriverInput {
  lastName: string;
  firstName: string;
  middleName?: string;
  phone?: string;
}

export const driverSchema = z.object({
  lastName: z.string().min(1, "Фамилия обязательна").optional(),
  firstName: z.string().min(1, "Имя обязательно").optional(),
  middleName: z.string().optional(),
  phone: z.string().optional(),
});

export type DriverForm = z.infer<typeof driverSchema>;

export const newDriverSchema = z.object({
  lastName: z.string().min(1, "Фамилия обязательна"),
  firstName: z.string().min(1, "Имя обязательно"),
  middleName: z.string().optional(),
  phone: z.string().optional(),
});

export type NewDriverForm = z.infer<typeof newDriverSchema>;
