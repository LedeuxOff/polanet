import z from "zod";

export interface Car {
  id: number;
  brand: string;
  licensePlate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarInput {
  brand: string;
  licensePlate: string;
}

export const carSchema = z.object({
  brand: z.string().min(1, "Марка автомобиля обязательна").optional(),
  licensePlate: z.string().min(1, "Гос номер обязателен").optional(),
});

export type CarForm = z.infer<typeof carSchema>;
