export interface User {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string | null;
  birthDate: string | null;
  email: string;
  phone: string | null;
  roleId: number;
  roleCode?: string;
  roleName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  token: string;
  user: {
    id: number;
    email: string;
    lastName: string;
    firstName: string;
    middleName: string | null;
    roleId: number;
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  lastName: string;
  firstName: string;
  middleName?: string;
  birthDate?: string;
  email: string;
  phone?: string;
  password: string;
  roleId: number;
}
