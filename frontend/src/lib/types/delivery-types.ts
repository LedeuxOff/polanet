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
  status: DeliveryStatus;
  incomeId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryWithIncome extends Delivery {
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
}
