import z from "zod";

export type DeliveryStatus = "in_progress" | "completed";

export interface Delivery {
  id: number;
  orderId: number;
  driverId: number;
  carId: number;
  dateTime: string;
  volume: number | null;
  comment: string | null;
  paymentMethod: "cash" | "bank_transfer";
  isPaymentBeforeUnloading: boolean;
  notifyClient: boolean;
  notifyDriver: boolean;
  status: DeliveryStatus;
  incomeId: number | null;
  createdAt: string;
  updatedAt: string;
  amount: number;
}

export interface DeliveryWithIncome extends Delivery {
  income?: Income;
}

// Расширенный тип для календаря с вложенными объектами
export interface CalendarDelivery extends Delivery {
  driver?: {
    id: number;
    lastName: string;
    firstName: string;
    middleName?: string | null;
    phone?: string | null;
  };
  car?: {
    id: number;
    brand: string;
    licensePlate: string;
  };
  order?: {
    id: number;
    type: string;
    address: string;
    payerLastName: string;
    payerFirstName: string;
    payerMiddleName?: string | null;
    payerPhone?: string | null;
    receiverLastName: string;
    receiverFirstName: string;
    receiverMiddleName?: string | null;
    receiverPhone?: string | null;
    clientId?: number | null;
  };
  client?: {
    id: number;
    type: "individual" | "legal";
    lastName?: string | null;
    firstName?: string | null;
    middleName?: string | null;
    organizationName?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  income?: Income;
}

export interface Income {
  id: number;
  incomeType: "prepayment" | "delivery_payment";
  paymentMethod: "cash" | "bank_transfer";
  isPaid: boolean;
  orderId: number;
  deliveryId: number | null;
  amount: number;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomeInput {
  incomeType: "prepayment" | "delivery_payment";
  paymentMethod: "cash" | "bank_transfer";
  isPaid?: boolean;
  orderId: number;
  deliveryId?: number | null;
  amount: number;
  paymentDate: string;
}

export interface UpdateIncomeInput {
  incomeType?: "prepayment" | "delivery_payment";
  paymentMethod?: "cash" | "bank_transfer";
  isPaid?: boolean;
  orderId?: number;
  deliveryId?: number | null;
  amount?: number;
  paymentDate?: string;
}

export interface CreateDeliveryInput {
  orderId: number;
  driverId: number;
  carId: number;
  dateTime: string;
  amount: number;
  volume?: number | null;
  comment?: string;
  paymentMethod: "cash" | "bank_transfer";
  isPaid: boolean;
  isPaymentBeforeUnloading?: boolean;
  notifyClient?: boolean;
  notifyDriver?: boolean;
}

export interface UpdateDeliveryInput {
  driverId?: number;
  carId?: number;
  dateTime?: string;
  amount?: number;
  volume?: number | null;
  comment?: string;
  paymentMethod?: "cash" | "bank_transfer";
  isPaid?: boolean;
  isPaymentBeforeUnloading?: boolean;
  notifyClient?: boolean;
  notifyDriver?: boolean;
}

export const deliverySchema = z.object({
  driverId: z.coerce.number().positive("Водитель обязателен"),
  carId: z.coerce.number().positive("Автомобиль обязателен"),
  dateTime: z.string().min(1, "Дата и время обязательны"),
  amount: z.coerce.number().int().positive("Стоимость должна быть положительной"),
  volume: z.coerce.number().optional().nullable(),
  comment: z.string().optional(),
  paymentMethod: z.enum(["cash", "bank_transfer"]).default("cash"),
  isPaid: z.boolean().default(false),
  isPaymentBeforeUnloading: z.boolean().default(false),
  notifyClient: z.boolean().default(false),
  notifyDriver: z.boolean().default(false),
});
