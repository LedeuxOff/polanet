import type { LoginInput, RegisterInput, User, Role, AuthTokens, CreateCarInput, Car, CreateDriverInput, Driver, CreateClientInput, Client, CreateOrderInput, Order, CreatePaymentInput, Payment, OrderHistory } from './types'

const API_BASE = '/api'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Ошибка запроса' }))
    throw new Error(error.error || 'Произошла ошибка')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export const api = {
  // Аутентификация
  auth: {
    login: (data: LoginInput) => request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    register: (data: RegisterInput) => request<AuthTokens>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    me: () => request<User>('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },

  // Пользователи
  users: {
    list: () => request<User[]>('/users'),
    get: (id: number) => request<User>(`/users/${id}`),
    create: (data: RegisterInput) => request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: Partial<RegisterInput>) => request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => request(`/users/${id}`, { method: 'DELETE' }),
  },

  // Роли
  roles: {
    list: () => request<Role[]>('/roles'),
    get: (id: number) => request<Role>(`/roles/${id}`),
    create: (data: { code: string; name: string }) => request<Role>('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: { code?: string; name?: string }) => request<Role>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => request(`/roles/${id}`, { method: 'DELETE' }),
  },

  // Автомобили
  cars: {
    list: () => request<Car[]>('/cars'),
    get: (id: number) => request<Car>(`/cars/${id}`),
    create: (data: CreateCarInput) => request<Car>('/cars', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: Partial<CreateCarInput>) => request<Car>(`/cars/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => request(`/cars/${id}`, { method: 'DELETE' }),
  },

  // Водители
  drivers: {
    list: () => request<Driver[]>('/drivers'),
    get: (id: number) => request<Driver>(`/drivers/${id}`),
    create: (data: CreateDriverInput) => request<Driver>('/drivers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: Partial<CreateDriverInput>) => request<Driver>(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => request(`/drivers/${id}`, { method: 'DELETE' }),
  },

  // Клиенты
  clients: {
    list: () => request<Client[]>('/clients'),
    get: (id: number) => request<Client>(`/clients/${id}`),
    create: (data: CreateClientInput) => request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: Partial<CreateClientInput>) => request<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => request(`/clients/${id}`, { method: 'DELETE' }),
  },

  // Заявки
  orders: {
    list: () => request<(Order & { payments: Payment[]; totalPaid: number; debt: number; isPaid: boolean; paymentStatus: 'unpaid' | 'paid' | 'partial' })[]>('/orders'),
    get: (id: number) => request<Order & { payments: Payment[]; totalPaid: number; debt: number; isPaid: boolean; paymentStatus: 'unpaid' | 'paid' | 'partial'; history: OrderHistory[] }>(`/orders/${id}`),
    create: (data: CreateOrderInput) => request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: Partial<CreateOrderInput>) => request<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => request(`/orders/${id}`, { method: 'DELETE' }),
    // Выплаты
    addPayment: (orderId: number, data: CreatePaymentInput) => request<Payment>(`/orders/${orderId}/payments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    removePayment: (orderId: number, paymentId: number) => request(`/orders/${orderId}/payments/${paymentId}`, { method: 'DELETE' }),
    // История
    getHistory: (orderId: number) => request<OrderHistory[]>(`/orders/${orderId}/history`),
  },
}
