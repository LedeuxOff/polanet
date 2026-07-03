import { API_BASE } from "./api-config";

export { transportCardsApi } from "./transport-cards";
export { authApi } from "./auth-api";
export { usersApi, type PaginationParams, type PaginationResponse } from "./users-api";
export { rolesApi } from "./roles-api";
export { carsApi } from "./cars-api";
export { clientsApi } from "./clients-api";
export { deliveriesApi } from "./deliveries-api";
export { ordersApi, type OrdersListQuery } from "./orders-api";
export { incomesApi } from "./incomes-api";
export { expensesApi } from "./expenses-api";
export { templatesApi } from "./templates-api";

const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.9.11";

export { APP_VERSION };

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-App-Version": APP_VERSION,
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
    const errorData = await response.json().catch(() => ({ error: "Ошибка запроса" }));
    const errorMessage = errorData.error || "Произошла ошибка";
    // Добавляем details к сообщению об ошибке, если они есть
    if (errorData.details) {
      throw new Error(`${errorMessage}\nDetails: ${JSON.stringify(errorData.details)}`);
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
