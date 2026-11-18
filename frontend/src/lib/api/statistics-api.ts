import { request } from "./index";

export interface FinanceMonth {
  month: number;
  prepayment: number;
  deliveryPayment: number;
  fuel: number;
  salary: number;
}

export interface FinanceStats {
  year: number;
  years: number[];
  months: FinanceMonth[];
  incomeByMethod: { key: "cash" | "bank_transfer"; total: number }[];
  unpaidIncome: number;
}

export interface OperationsStats {
  year: number;
  years: number[];
  months: { month: number; orders: number; deliveries: number; volume: number }[];
  ordersByStatus: { key: string; total: number }[];
  deliveriesByWeekday: { day: number; total: number }[];
  topClients: { id: number; name: string; orders: number }[];
  topDrivers: { id: number; name: string; deliveries: number; volume: number }[];
}

export interface WorksStats {
  year: number;
  years: number[];
  months: { month: number; works: number; area: number; revenue: number }[];
  byStatus: { key: string; name: string; color: string | null; total: number }[];
  byType: { key: string; name: string; total: number; area: number }[];
  byTeam: { id: number; name: string; works: number; area: number }[];
}

export const statisticsApi = {
  finances: (year: number) => request<FinanceStats>(`/statistics/finances?year=${year}`),
  operations: (year: number) => request<OperationsStats>(`/statistics/operations?year=${year}`),
  works: (year: number) => request<WorksStats>(`/statistics/works?year=${year}`),
};
