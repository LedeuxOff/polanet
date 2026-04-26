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
