export interface User {
  id: number
  lastName: string
  firstName: string
  middleName: string | null
  birthDate: string | null
  email: string
  phone: string | null
  roleId: number
  roleCode?: string
  roleName?: string
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: number
  code: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Car {
  id: number
  brand: string
  licensePlate: string
  createdAt: string
  updatedAt: string
}

export interface Driver {
  id: number
  lastName: string
  firstName: string
  middleName: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
  transportCard?: TransportCard | null
}

export interface AuthTokens {
  token: string
  user: {
    id: number
    email: string
    lastName: string
    firstName: string
    middleName: string | null
    roleId: number
  }
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  lastName: string
  firstName: string
  middleName?: string
  birthDate?: string
  email: string
  phone?: string
  password: string
  roleId: number
}

export interface CreateCarInput {
  brand: string
  licensePlate: string
}

export interface CreateDriverInput {
  lastName: string
  firstName: string
  middleName?: string
  phone?: string
}

export interface Client {
  id: number
  type: 'individual' | 'legal'
  lastName: string | null
  firstName: string | null
  middleName: string | null
  organizationName: string | null
  phone: string | null
  email: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateClientInput {
  type: 'individual' | 'legal'
  lastName?: string
  firstName?: string
  middleName?: string
  organizationName?: string
  phone?: string
  email?: string
}

export interface Order {
  id: number
  type: 'delivery' | 'pickup'
  address: string
  cost: number
  payerLastName: string
  payerFirstName: string
  payerMiddleName: string | null
  receiverLastName: string
  receiverFirstName: string
  receiverMiddleName: string | null
  dateTime: string
  hasPass: boolean
  addressComment: string | null
  status: 'new' | 'in_progress' | 'completed' | 'cancelled' | 'archived' | 'draft'
  paymentType: 'cash' | 'bank_transfer'
  clientId: number | null
  driverId: number | null
  carId: number | null
  createdById: number | null
  createdAt: string
  updatedAt: string
  // Вычисляемые поля
  payments?: Payment[]
  totalPaid?: number
  debt?: number
  isPaid?: boolean
  paymentStatus?: 'unpaid' | 'paid' | 'partial'
  history?: OrderHistory[]
}

export interface Payment {
  id: number
  orderId: number
  amount: number
  paymentDate: string
  createdAt: string
}

export interface OrderHistory {
  id: number
  orderId: number
  userId: number
  action: string
  fieldName: string | null
  oldValue: string | null
  newValue: string | null
  createdAt: string
  userLastName?: string
  userFirstName?: string
  userMiddleName?: string
}

export interface CreateOrderInput {
  type: 'delivery' | 'pickup'
  address: string
  cost: number
  payerLastName: string
  payerFirstName: string
  payerMiddleName?: string
  receiverLastName: string
  receiverFirstName: string
  receiverMiddleName?: string
  dateTime: string
  hasPass?: boolean
  addressComment?: string
  status?: 'new' | 'in_progress' | 'completed' | 'cancelled' | 'archived' | 'draft'
  paymentType: 'cash' | 'bank_transfer'
  clientId?: number | null
  driverId?: number | null
  carId?: number | null
}

export interface CreatePaymentInput {
  orderId: number
  amount: number
  paymentDate: string
}

export interface TransportCard {
  id: number
  cardNumber: string
  driverId: number | null
  driver?: Driver | null
  createdAt: string
  updatedAt: string
  expenses?: TransportCardExpense[]
  totalExpenses?: number
  history?: TransportCardHistory[]
}

export interface TransportCardExpense {
  id: number
  cardId: number
  amount: number
  paymentDate: string
  createdAt: string
}

export interface TransportCardHistory {
  id: number
  cardId: number
  userId: number
  action: string
  fieldName: string | null
  oldValue: string | null
  newValue: string | null
  createdAt: string
  userLastName?: string
  userFirstName?: string
  userMiddleName?: string
}

export interface CreateTransportCardInput {
  cardNumber: string
  driverId?: number | null
}

export interface CreateTransportCardExpenseInput {
  cardId: number
  amount: number
  paymentDate: string
}
