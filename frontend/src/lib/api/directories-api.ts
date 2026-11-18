import { request } from ".";
import type { StatusColor, WorkStatusRef, WorkTypeRef } from "../types";

export interface WorkStatusRefInput {
  name: string;
  color?: StatusColor;
  sortOrder?: number;
  showInCalendar?: boolean;
}

export interface WorkTypeRefInput {
  name: string;
  sortOrder?: number;
}

/** Справочники календаря работ: статусы и типы работ */
export const directoriesApi = {
  workStatuses: () => request<WorkStatusRef[]>("/directories/work-statuses"),
  createWorkStatus: (data: WorkStatusRefInput) =>
    request<WorkStatusRef>("/directories/work-statuses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateWorkStatus: (id: number, data: Partial<WorkStatusRefInput>) =>
    request<WorkStatusRef>(`/directories/work-statuses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteWorkStatus: (id: number) =>
    request<void>(`/directories/work-statuses/${id}`, { method: "DELETE" }),

  workTypes: () => request<WorkTypeRef[]>("/directories/work-types"),
  createWorkType: (data: WorkTypeRefInput) =>
    request<WorkTypeRef>("/directories/work-types", { method: "POST", body: JSON.stringify(data) }),
  updateWorkType: (id: number, data: Partial<WorkTypeRefInput>) =>
    request<WorkTypeRef>(`/directories/work-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteWorkType: (id: number) =>
    request<void>(`/directories/work-types/${id}`, { method: "DELETE" }),
};
