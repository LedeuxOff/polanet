import type {
  LoginInput,
  RegisterInput,
  User,
  Role,
  AuthTokens,
  CreateCarInput,
  Car,
  CreateDriverInput,
  Driver,
  CreateClientInput,
  Client,
  CreateOrderInput,
  Order,
  CreatePaymentInput,
  Payment,
  OrderHistory,
  CreateTransportCardInput,
  TransportCard,
  CreateTransportCardExpenseInput,
  TransportCardExpense,
  TransportCardHistory,
  CreateDeliveryInput,
  Delivery,
} from "./types";





export const api = {
  // Аутентификация
  ,

  // Пользователи
  ,

  // Роли
  ,

  // Автомобили
  cars: {
    list: () => request<Car[]>("/cars"),
    get: (id: number) => request<Car>(`/cars/${id}`),
    create: (data: CreateCarInput) =>
      request<Car>("/cars", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<CreateCarInput>) =>
      request<Car>(`/cars/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) => request(`/cars/${id}`, { method: "DELETE" }),
  },

  // Водители
  

  // Клиенты
  clients: {
    list: () => request<Client[]>("/clients"),
    get: (id: number) => request<Client>(`/clients/${id}`),
    create: (data: CreateClientInput) =>
      request<Client>("/clients", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<CreateClientInput>) =>
      request<Client>(`/clients/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) => request(`/clients/${id}`, { method: "DELETE" }),
  },

  // Заявки
  orders: {
    list: () =>
      request<
        (Order & {
          payments: Payment[];
          received: number;
          completed: number;
          customerDebt: number;
          companyDebt: number;
          isPaid: boolean;
          paymentStatus: "unpaid" | "paid" | "partial";
        })[]
      >("/orders"),
    get: (id: number) =>
      request<
        Order & {
          payments: Payment[];
          received: number;
          completed: number;
          customerDebt: number;
          companyDebt: number;
          isPaid: boolean;
          paymentStatus: "unpaid" | "paid" | "partial";
          history: OrderHistory[];
        }
      >(`/orders/${id}`),
    create: (data: CreateOrderInput) =>
      request<Order>("/orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    quickCreate: (data: { clientId: number; cost: number }) =>
      request<Order>("/orders/quick", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<CreateOrderInput>) =>
      request<Order>(`/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) => request(`/orders/${id}`, { method: "DELETE" }),
    // Выплаты
    addPayment: (orderId: number, data: CreatePaymentInput) =>
      request<Payment>(`/orders/${orderId}/payments`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    removePayment: (orderId: number, paymentId: number) =>
      request(`/orders/${orderId}/payments/${paymentId}`, { method: "DELETE" }),
    // История
    getHistory: (orderId: number) =>
      request<OrderHistory[]>(`/orders/${orderId}/history`),
  },

  // Транспортные карты
  

  // Доставки
  deliveries: {
    list: (orderId: number) =>
      request<Delivery[]>(`/deliveries/order/${orderId}`),
    get: (id: number) => request<Delivery>(`/deliveries/${id}`),
    create: (data: CreateDeliveryInput) =>
      request<Delivery>("/deliveries", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<CreateDeliveryInput>) =>
      request<Delivery>(`/deliveries/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) => request(`/deliveries/${id}`, { method: "DELETE" }),
    pay: (id: number) =>
      request<Delivery>(`/deliveries/${id}/pay`, {
        method: "POST",
      }),
  },
};
