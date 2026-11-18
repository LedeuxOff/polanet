import z from "zod";

/** Рабочий — пользователь с ролью WORKER */
export interface Worker {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string | null;
  phone: string | null;
  teamId: number | null;
  teamName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerInput {
  lastName: string;
  firstName: string;
  middleName?: string | null;
  phone?: string | null;
  teamId?: number | null;
}

export const workerSchema = z.object({
  lastName: z.string().trim().min(1, "Фамилия обязательна"),
  firstName: z.string().trim().min(1, "Имя обязательно"),
  middleName: z.string().optional(),
  phone: z.string().optional(),
  // "none" — без бригады
  teamId: z.string().optional(),
});

export type WorkerForm = z.infer<typeof workerSchema>;

export const getWorkerName = (w: Pick<Worker, "lastName" | "firstName" | "middleName">) =>
  [w.lastName, w.firstName, w.middleName].filter(Boolean).join(" ");
