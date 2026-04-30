import { useState, useEffect, useCallback } from "react";
import { systemLogsApi, type ServerError } from "@/lib/api/system-logs-api";
import { usePermissions } from "@/lib/contexts/permission-context";

export const useSystemLogs = () => {
  const [errors, setErrors] = useState<ServerError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { hasPermission } = usePermissions();

  const loadErrors = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await systemLogsApi.getErrors();
      setErrors(data);
      setLastUpdated(new Date().toLocaleString("ru-RU"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAllErrors = useCallback(async () => {
    try {
      await systemLogsApi.clearErrors();
      setErrors([]);
      setLastUpdated(new Date().toLocaleString("ru-RU"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    }
  }, []);

  useEffect(() => {
    loadErrors();
  }, [loadErrors]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("ru-RU");
  };

  const canClearErrors = hasPermission("system-logs:clear");

  return {
    errors,
    isLoading,
    error,
    lastUpdated,
    refresh: loadErrors,
    clearAllErrors,
    formatTimestamp,
    canClearErrors,
  };
};
