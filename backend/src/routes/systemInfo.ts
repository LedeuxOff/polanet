import { Router } from "express";
import os from "os";
import { authenticate } from "../middleware/auth";
import { exec, execSync } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const router = Router();

interface SystemStats {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: DiskInfo[];
  network: NetworkInfo;
  uptime: number;
  os: OSInfo;
  timestamp: string;
}

interface DiskInfo {
  mount: string;
  type: string;
  size: number;
  used: number;
  free: number;
  usagePercent: number;
}

interface NetworkInfo {
  interfaceName: string;
  ip: string;
  mac: string;
  bytesSent: number;
  bytesReceived: number;
  bytesSentFormatted: string;
  bytesReceivedFormatted: string;
}

interface OSInfo {
  platform: string;
  type: string;
  release: string;
  arch: string;
  hostname: string;
  totalMemory: number; // GB
  cpuModel: string;
  cpuCores: number;
  distro?: string;
  distroVersion?: string;
}

// Simple CPU usage tracking
let lastCpuCheck = {
  idle: 0,
  total: 0,
  timestamp: Date.now(),
};

function calculateCpuUsage(): number {
  const cpus = os.cpus();
  let idleTotal = 0;
  let tickTotal = 0;

  cpus.forEach((cpu) => {
    for (const type in cpu.times) {
      tickTotal += (cpu.times as any)[type];
    }
    idleTotal += cpu.times.idle;
  });

  const timestamp = Date.now();
  const timeDiff = timestamp - lastCpuCheck.timestamp;
  const idleDiff = idleTotal - lastCpuCheck.idle;
  const totalDiff = tickTotal - lastCpuCheck.total;

  let usage = 0;
  if (timeDiff > 0 && totalDiff > 0) {
    usage = Math.round(((totalDiff - idleDiff) / totalDiff) * 100);
  }

  lastCpuCheck = {
    idle: idleTotal,
    total: tickTotal,
    timestamp,
  };

  return Math.min(Math.max(usage, 0), 100);
}

function getMemoryUsagePercent(): number {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const usagePercent = (usedMem / totalMem) * 100;
  return Math.round(Math.min(Math.max(usagePercent, 0), 100));
}

function execSyncSafe(command: string): string {
  try {
    const output = execSync(command, { timeout: 5000, encoding: "utf-8" });
    return output.toString();
  } catch {
    return "";
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${value.toFixed(2)} ${units[i]}`;
}

function getDiskInfo(): DiskInfo[] {
  const disks: DiskInfo[] = [];

  try {
    if (process.platform === "win32") {
      // Windows: PowerShell approach - more reliable
      const psOutput = execSyncSafe(
        "powershell -NoProfile -Command \"[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3' | Select-Object DeviceID,Size,FreeSpace,FileSystem | ConvertTo-Json -Depth 10\"",
      );

      if (psOutput && psOutput.trim()) {
        try {
          const diskArray = JSON.parse(psOutput);

          for (const diskData of Array.isArray(diskArray) ? diskArray : [diskArray]) {
            const name = diskData?.DeviceID?.trim() || "";
            const size = parseFloat(diskData?.Size) || 0;
            const free = parseFloat(diskData?.FreeSpace) || 0;
            const fs = diskData?.FileSystem || "NTFS";

            if (name && size > 0) {
              const used = size - free;
              disks.push({
                mount: name,
                type: fs,
                size: size / (1024 * 1024 * 1024),
                used: used / (1024 * 1024 * 1024),
                free: free / (1024 * 1024 * 1024),
                usagePercent: Math.round((used / size) * 100),
              });
            }
          }
        } catch (e) {
          console.error("PowerShell JSON parse error:", e);
        }
      }
    } else {
      // Linux/Ubuntu: Use df with POSIX output for reliability
      const output = execSyncSafe(
        'df -BG --output=target,fstype,size,used,avail,pct 2>/dev/null | grep -v -E "^tmpfs|^devtmpfs|^none|\\(.*\\)$"',
      );

      if (output && output.trim()) {
        const lines = output.trim().split("\n");

        for (const line of lines) {
          // Parse: Filesystem 1G-blocks Used Available Use% Mounted
          const parts = line.split(/\s+/);
          if (parts.length >= 6) {
            const mount = parts[0];
            const type = parts[1];
            const size = parseFloat(parts[2].replace("G", "")) || 0;
            const used = parseFloat(parts[3].replace("G", "")) || 0;
            const free = parseFloat(parts[4].replace("G", "")) || 0;
            const usagePercent = parseInt(parts[5].replace("%", "")) || 0;

            // Skip small virtual filesystems
            if (size > 0.1) {
              disks.push({
                mount,
                type,
                size,
                used,
                free,
                usagePercent,
              });
            }
          }
        }
      }

      // Fallback: simpler df command
      if (disks.length === 0) {
        const fallbackOutput = execSyncSafe("df -h --local 2>/dev/null | tail -n +2");
        const lines = fallbackOutput.trim().split("\n");

        for (const line of lines) {
          const parts = line.split(/\s+/);
          if (parts.length >= 6) {
            const mount = parts[5];
            const type = parts[2].toLowerCase();
            const sizeStr = parts[1].toUpperCase().replace("G", "").replace("T", "");
            const usedStr = parts[2].toUpperCase().replace("G", "").replace("T", "");
            const freeStr = parts[3].toUpperCase().replace("G", "").replace("T", "");

            let size = parseFloat(parts[1]) || 0;
            let used = parseFloat(parts[2]) || 0;
            let free = parseFloat(parts[3]) || 0;

            // Convert TB to GB if needed
            if (parts[1].includes("T")) size *= 1024;
            if (parts[2].includes("T")) used *= 1024;
            if (parts[3].includes("T")) free *= 1024;

            const usagePercent = parseInt(parts[4].replace("%", "")) || 0;

            if (size > 0) {
              disks.push({
                mount,
                type: type || "ext4",
                size,
                used,
                free,
                usagePercent,
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error getting disk info:", error);
  }

  // Fallback if no disks found
  if (disks.length === 0) {
    disks.push({
      mount: process.platform === "win32" ? "C:" : "/",
      type: process.platform === "win32" ? "NTFS" : "ext4",
      size: 0,
      used: 0,
      free: 0,
      usagePercent: 0,
    });
  }

  return disks;
}

function getNetworkInfo(): NetworkInfo {
  const interfaces = os.networkInterfaces();
  const primaryInterface: NetworkInfo = {
    interfaceName: "N/A",
    ip: "N/A",
    mac: "N/A",
    bytesSent: 0,
    bytesReceived: 0,
    bytesSentFormatted: "0 B",
    bytesReceivedFormatted: "0 B",
  };

  // Find first non-loopback interface (prefer eth0 on Linux, Ethernet on Windows)
  const preferredInterfaces = ["eth0", "enp", "ens", "eno", "Wi-Fi", "Ethernet", "wlan0"];

  for (const preferred of preferredInterfaces) {
    const addrList = interfaces[preferred];
    if (addrList) {
      const validAddress = addrList.find((addr) => !addr.internal);
      if (validAddress) {
        primaryInterface.interfaceName = preferred;
        primaryInterface.ip = validAddress.address;
        primaryInterface.mac = validAddress.mac;
        break;
      }
    }
  }

  // Fallback: find any non-loopback interface
  if (primaryInterface.interfaceName === "N/A") {
    for (const [name, addresses] of Object.entries(interfaces)) {
      if (name.startsWith("lo") || name.startsWith("lo0")) continue;

      const validAddress = addresses?.find((addr) => !addr.internal);
      if (validAddress) {
        primaryInterface.interfaceName = name;
        primaryInterface.ip = validAddress.address;
        primaryInterface.mac = validAddress.mac;
        break;
      }
    }
  }

  // Get network I/O stats
  try {
    if (process.platform === "win32") {
      // Windows: Get per-interface stats via Get-NetAdapter
      const output = execSyncSafe(
        "powershell -NoProfile -Command \"Get-NetAdapter | Where-Object {$_.Status -eq 'Up'} | Select-Object Name,ReceiveBytes,SendBytes | ConvertTo-Json\"",
      );

      if (output && output.trim()) {
        try {
          const adapters = JSON.parse(output);
          const adapterArray = Array.isArray(adapters) ? adapters : [adapters];

          for (const adapter of adapterArray) {
            const name = adapter?.Name || "";
            if (
              name.includes(primaryInterface.interfaceName) ||
              primaryInterface.interfaceName === "N/A"
            ) {
              primaryInterface.bytesReceived = parseInt(adapter?.ReceiveBytes) || 0;
              primaryInterface.bytesSent = parseInt(adapter?.SendBytes) || 0;
              break;
            }
          }
        } catch (e) {
          console.error("Windows network stats parse error:", e);
        }
      }
    } else {
      // Linux/Ubuntu: /proc/net/dev
      const output = execSyncSafe("cat /proc/net/dev");

      if (output && output.trim()) {
        const lines = output.trim().split("\n").slice(2);
        const ifaceName = primaryInterface.interfaceName.split(":")[0];

        for (const line of lines) {
          if (line.includes(ifaceName)) {
            const parts = line.split(/\s+/);
            if (parts.length >= 10) {
              primaryInterface.bytesReceived = parseInt(parts[1]) || 0;
              primaryInterface.bytesSent = parseInt(parts[9]) || 0;
            }
            break;
          }
        }
      }

      // Fallback: read from /sys/class/net
      if (primaryInterface.bytesReceived === 0 && primaryInterface.bytesSent === 0) {
        const ifaceName = primaryInterface.interfaceName.split(":")[0];
        const rxOutput = execSyncSafe(
          `cat /sys/class/net/${ifaceName}/statistics/rx_bytes 2>/dev/null`,
        );
        const txOutput = execSyncSafe(
          `cat /sys/class/net/${ifaceName}/statistics/tx_bytes 2>/dev/null`,
        );

        if (rxOutput.trim()) {
          primaryInterface.bytesReceived = parseInt(rxOutput.trim()) || 0;
        }
        if (txOutput.trim()) {
          primaryInterface.bytesSent = parseInt(txOutput.trim()) || 0;
        }
      }
    }
  } catch (error) {
    console.error("Error getting network stats:", error);
  }

  primaryInterface.bytesSentFormatted = formatBytes(primaryInterface.bytesSent);
  primaryInterface.bytesReceivedFormatted = formatBytes(primaryInterface.bytesReceived);

  return primaryInterface;
}

function getUptimeSeconds(): number {
  return Math.round(os.uptime());
}

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

function getOSInfo(): OSInfo {
  const osInformation: OSInfo = {
    platform:
      process.platform === "win32" ? "Windows" : process.platform === "darwin" ? "macOS" : "Linux",
    type: os.type(),
    release: os.release(),
    arch: os.arch(),
    hostname: os.hostname(),
    totalMemory: os.totalmem() / (1024 * 1024 * 1024),
    cpuModel: os.cpus()[0]?.model || "Unknown",
    cpuCores: os.cpus().length,
  };

  // Get Ubuntu/Debian distro info
  if (process.platform !== "win32") {
    const osRelease = execSyncSafe("cat /etc/os-release 2>/dev/null");
    if (osRelease) {
      const nameMatch = osRelease.match(/^PRETTY_NAME="(.+?)"$/m);
      const versionMatch = osRelease.match(/^VERSION_ID="(.+?)"$/m);

      if (nameMatch) {
        osInformation.distro = nameMatch[1].replace(/"/g, "").split(" ")[0];
      }
      if (versionMatch) {
        osInformation.distroVersion = versionMatch[1];
      }
    }
  }

  return osInformation;
}

router.get("/stats", authenticate, (req, res) => {
  const cpuUsage = calculateCpuUsage();
  const memoryUsage = getMemoryUsagePercent();
  const diskUsage = getDiskInfo();
  const network = getNetworkInfo();
  const uptime = getUptimeSeconds();
  const osInfo = getOSInfo();

  const stats: SystemStats = {
    cpuUsage,
    memoryUsage,
    diskUsage,
    network,
    uptime,
    os: osInfo,
    timestamp: new Date().toISOString(),
  };

  res.json(stats);
});

export default router;
