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
