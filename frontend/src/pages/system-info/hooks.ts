import { useState, useEffect, useCallback } from "react";
import { systemInfoApi, SystemStats } from "@/lib/api/system-info-api";

export const useSystemInfo = () => {
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [diskUsage, setDiskUsage] = useState<SystemStats["diskUsage"]>([]);
  const [network, setNetwork] = useState<SystemStats["network"] | null>(null);
  const [osInfo, setOsInfo] = useState<SystemStats["os"] | null>(null);
  const [uptime, setUptime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const data: SystemStats = await systemInfoApi.getStats();
      setCpuUsage(data.cpuUsage);
      setMemoryUsage(data.memoryUsage);
      setDiskUsage(data.diskUsage);
      setNetwork(data.network);
      setOsInfo(data.os);
      setUptime(data.uptime);
      setLastUpdated(new Date(data.timestamp).toLocaleTimeString("ru-RU"));
      setError(null);
    } catch (err) {
      setError("Ошибка загрузки данных о системе");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    // Refresh every 5 seconds
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, [loadStats]);

  // Format uptime
  const formattedUptime = uptime > 0 ? formatUptime(uptime) : null;

  return {
    cpuUsage,
    memoryUsage,
    diskUsage,
    network,
    osInfo,
    uptime,
    formattedUptime,
    isLoading,
    error,
    lastUpdated,
    refresh: loadStats,
  };
};

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} дн.`);
  if (hours > 0) parts.push(`${hours} ч.`);
  if (minutes > 0) parts.push(`${minutes} мин.`);

  return parts.join(" ") || "0 мин.";
}
