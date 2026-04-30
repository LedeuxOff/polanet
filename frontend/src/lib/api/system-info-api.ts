import { request } from "./index";

export interface DiskInfo {
  mount: string;
  type: string;
  size: number;
  used: number;
  free: number;
  usagePercent: number;
}

export interface NetworkInfo {
  interfaceName: string;
  ip: string;
  mac: string;
  bytesSent: number;
  bytesReceived: number;
  bytesSentFormatted: string;
  bytesReceivedFormatted: string;
}

export interface OSInfo {
  platform: string;
  type: string;
  release: string;
  arch: string;
  hostname: string;
  totalMemory: number;
  cpuModel: string;
  cpuCores: number;
  distro?: string;
  distroVersion?: string;
}

export interface SystemStats {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: DiskInfo[];
  network: NetworkInfo;
  uptime: number;
  os: OSInfo;
  timestamp: string;
}

export const systemInfoApi = {
  getStats: () => request<SystemStats>("/system-info/stats"),
};
