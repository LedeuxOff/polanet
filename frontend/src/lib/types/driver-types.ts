import { TransportCard } from "./transport-card-types";

export interface Driver {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  transportCard?: TransportCard | null;
}

export interface CreateDriverInput {
  lastName: string;
  firstName: string;
  middleName?: string;
  phone?: string;
}