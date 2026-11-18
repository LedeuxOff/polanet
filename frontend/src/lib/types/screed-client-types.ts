/** Клиент стяжки (раздел «Стяжка») */
export interface ScreedClient {
  id: number;
  lastName: string | null;
  firstName: string;
  middleName: string | null;
  phone: string | null;
  notes: string | null;
  worksCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScreedClientInput {
  lastName?: string | null;
  firstName: string;
  middleName?: string | null;
  phone?: string | null;
  notes?: string | null;
}
