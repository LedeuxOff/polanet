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

export interface Order {
  id: number;
  type: "delivery" | "pickup";
  address: string;
  cost: number;
  payerLastName: string;
  payerFirstName: string;
  payerMiddleName: string | null;
  receiverLastName: string;
  receiverFirstName: string;
  receiverMiddleName: string | null;
  dateTime: string;
  hasPass: boolean;
  addressComment: string | null;
  status: "new" | "in_progress" | "completed" | "cancelled" | "archived" | "draft";
  paymentType: "cash" | "bank_transfer";
  clientId: number | null;
  createdById: number | null;
  createdAt: string;
  updatedAt: string;
  // Вычисляемые поля
  payments?: Payment[];
  received?: number;
  completed?: number;
  customerDebt?: number;
  companyDebt?: number;
  isPaid?: boolean;
  paymentStatus?: "unpaid" | "paid" | "partial";
  history?: OrderHistory[];
}

export interface Payment {
  id: number;
  orderId: number;
  deliveryId: number | null;
  amount: number;
  paymentDate: string;
  type: "prepayment" | "transfer" | "delivery";
  createdAt: string;
}

export interface OrderHistory {
  id: number;
  orderId: number;
  userId: number;
  action: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  userLastName?: string;
  userFirstName?: string;
  userMiddleName?: string;
}

export interface CreateOrderInput {
  type: "delivery" | "pickup";
  address: string;
  cost: number;
  payerLastName: string;
  payerFirstName: string;
  payerMiddleName?: string;
  receiverLastName: string;
  receiverFirstName: string;
  receiverMiddleName?: string;
  dateTime: string;
  hasPass?: boolean;
  addressComment?: string;
  status?: "new" | "in_progress" | "completed" | "cancelled" | "archived" | "draft";
  paymentType: "cash" | "bank_transfer";
  clientId?: number | null;
}

export interface CreatePaymentInput {
  orderId: number;
  deliveryId?: number | null;
  amount: number;
  paymentDate: string;
  type: "prepayment" | "transfer" | "delivery";
}

export interface Delivery {
  id: number;
  orderId: number;
  driverId: number;
  carId: number;
  dateTime: string;
  cost: number;
  volume: number | null;
  comment: string | null;
  isPaid: boolean;
  isCashPayment: boolean;
  isUnloadingBeforeUnloading: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliveryInput {
  orderId: number;
  driverId: number;
  carId: number;
  dateTime: string;
  cost: number;
  volume?: number | null;
  comment?: string;
  isPaid?: boolean;
  isCashPayment?: boolean;
  isUnloadingBeforeUnloading?: boolean;
}
