/** Код статуса из справочника work_statuses (preliminary, scheduled, …) */
export type WorkStatus = string;
/** Код типа работ из справочника work_types */
export type WorkType = string;

/** Ключ цвета статуса из палитры (см. pages/works/consts.ts) */
export type StatusColor =
  | "amber"
  | "violet"
  | "orange"
  | "blue"
  | "green"
  | "zinc"
  | "red"
  | "slate"
  | "cyan"
  | "pink";

export interface WorkStatusRef {
  id: number;
  code: string;
  name: string;
  color: StatusColor;
  sortOrder: number;
  showInCalendar: boolean;
}

export interface WorkTypeRef {
  id: number;
  code: string;
  name: string;
  sortOrder: number;
}

export interface Team {
  id: number;
  name: string;
  isActive: boolean;
  sortOrder: number;
  legacyId: number | null;
  createdAt: string;
  updatedAt: string;
  /** Число рабочих в бригаде (в списке бригад) */
  memberCount?: number;
}

export interface TeamMember {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string | null;
  phone: string | null;
}

export interface TeamDetail extends Team {
  members: TeamMember[];
}

/** Клиент работы — клиент стяжки */
export interface WorkClient {
  id: number;
  lastName: string | null;
  firstName: string;
  middleName: string | null;
  phone: string | null;
}

export interface Work {
  id: number;
  date: string; // YYYY-MM-DD
  startTime: string | null; // HH:MM, начало
  endTime: string | null; // HH:MM, окончание
  teamId: number | null;
  clientId: number | null;
  address: string | null;
  area: number | null;
  thickness: number | null;
  strength: string | null;
  workType: WorkType;
  hoseLength: number | null;
  isTransmix: boolean;
  price: number | null;
  status: WorkStatus;
  statusInfo: { code: string; name: string; color: StatusColor };
  workTypeInfo: { code: string; name: string };
  /** Замерщик — рабочий (роль WORKER) */
  measurerId: number | null;
  measurer: { id: number; lastName: string; firstName: string; middleName: string | null } | null;
  /** Имя замерщика из старой системы */
  measurerName: string | null;
  notes: string | null;
  legacyId: number | null;
  createdById: number | null;
  createdAt: string;
  updatedAt: string;
  client: WorkClient | null;
  team: { id: number; name: string } | null;
}

export interface WorkNewClientInput {
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
}

export interface WorkInput {
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  teamId?: number | null;
  clientId?: number | null;
  newClient?: WorkNewClientInput;
  address?: string | null;
  area?: number | null;
  thickness?: number | null;
  strength?: string | null;
  workType?: WorkType;
  hoseLength?: number | null;
  isTransmix?: boolean;
  price?: number | null;
  status?: WorkStatus;
  measurerId?: number | null;
  notes?: string | null;
}

export interface TeamInput {
  name: string;
  isActive?: boolean;
  sortOrder?: number;
  /** Полный состав бригады — id рабочих */
  memberIds?: number[];
}
