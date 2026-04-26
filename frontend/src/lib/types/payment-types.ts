export interface Payment {
  id: number;
  orderId: number;
  deliveryId: number | null;
  amount: number;
  paymentDate: string;
  type: "prepayment" | "transfer" | "delivery";
  createdAt: string;
}

export interface CreatePaymentInput {
  orderId: number;
  deliveryId?: number | null;
  amount: number;
  paymentDate: string;
  type: "prepayment" | "transfer" | "delivery";
}
