import type { LoginInput, RegisterInput, User, Role, AuthTokens } from './types'

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
    create: (data: { code: string; name: string }) => request<Role>('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
}
