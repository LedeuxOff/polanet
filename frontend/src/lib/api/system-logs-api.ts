import { request } from "./index";

export interface ServerError {
  id: number;
  timestamp: string;
  message: string;
  stack?: string;
  endpoint?: string;
  method?: string;
  appVersion?: string;
  userAgent?: string;
}

export const systemLogsApi = {
  getErrors: () => request<ServerError[]>("/system-logs/errors"),

  getErrorsByVersion: (version: string) =>
    request<ServerError[]>("/system-logs/errors", {
      headers: { "X-App-Version": version },
    }),

  logError: (data: {
    message: string;
    stack?: string;
    endpoint?: string;
    method?: string;
    appVersion?: string;
    userAgent?: string;
  }) =>
    request<ServerError>("/system-logs/errors", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  clearErrors: () => request<void>("/system-logs/errors", { method: "DELETE" }),
};
