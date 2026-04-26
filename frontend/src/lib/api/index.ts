import { API_BASE } from "./api-config";

export { driversApi } from "./drivers";
export { transportCardsApi } from "./transport-cards";
export { authApi } from "./auth-api";
export { usersApi } from "./users-api";

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Ошибка запроса" }));
    throw new Error(error.error || "Произошла ошибка");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
