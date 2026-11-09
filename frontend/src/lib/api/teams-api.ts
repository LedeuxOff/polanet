import { request } from ".";
import type { Team, TeamDetail, TeamInput } from "../types";

export const teamsApi = {
  /** all=true — вместе с неактивными бригадами */
  list: (all = false) => request<Team[]>(`/teams${all ? "?all=1" : ""}`),
  get: (id: number) => request<TeamDetail>(`/teams/${id}`),
  create: (data: TeamInput) =>
    request<TeamDetail>("/teams", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<TeamInput>) =>
    request<TeamDetail>(`/teams/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/teams/${id}`, { method: "DELETE" }),
};
