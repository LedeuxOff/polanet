import { request } from ".";
import { RegisterInput, User } from "../types";

export const usersApi = {
  list: () => request<User[]>("/users"),
  get: (id: number) => request<User>(`/users/${id}`),
  create: (data: RegisterInput) =>
    request<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<RegisterInput>) =>
    request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request(`/users/${id}`, { method: "DELETE" }),
};
