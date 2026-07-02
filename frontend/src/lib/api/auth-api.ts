import { request } from ".";
import { AuthTokens, LoginInput, RegisterInput, User } from "../types";

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export const authApi = {
  login: (data: LoginInput) =>
    request<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  register: (data: RegisterInput) =>
    request<AuthTokens>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: () => request<User>("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),
  changePassword: (data: ChangePasswordInput) =>
    request<{ success: boolean; message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
