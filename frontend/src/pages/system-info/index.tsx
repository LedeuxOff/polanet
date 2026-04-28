import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HomeIcon,
  RefreshCw,
  HardDriveIcon,
  NetworkIcon as NetworkIconLucide,
  ClockIcon,
  MonitorIcon,
  CpuIcon,
  DatabaseIcon,
  ServerIcon,
} from "lucide-react";
import { useSystemInfo } from "./hooks";
import { DonutChart } from "./ui/donut-chart";
import { DiskChart } from "./ui/disk-chart";
import { NetworkChart } from "./ui/network-chart";

export const SystemInfoPage = () => {
  const {
    cpuUsage,
    memoryUsage,
    diskUsage,
    network,
    osInfo,
    formattedUptime,
    isLoading,
    error,
    lastUpdated,
    refresh,
  } = useSystemInfo();

  if (isLoading && !lastUpdated) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Информация о системе</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Загрузка...</p>
          </CardContent>
        </Card>
        <div className="fixed bottom-8 left-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md">
          <Link to="/">
            <Button type="button" className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900">
              <HomeIcon className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Информация о системе</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4 h-32">
            <p className="text-destructive">{error}</p>
            <Button onClick={refresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Повторить
            </Button>
          </CardContent>
        </Card>
        <div className="fixed bottom-8 left-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md">
          <Link to="/">
            <Button type="button" className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900">
              <HomeIcon className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header with refresh */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Информация о системе</CardTitle>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Обновлено: {lastUpdated}</span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* OS Info Card - Top */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MonitorIcon className="w-5 h-5 text-muted-foreground" />
            <CardTitle>Операционная система</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {osInfo ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <ServerIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Платформа</div>
                  <div className="text-sm font-medium">{osInfo.platform}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <DatabaseIcon className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Дистрибутив</div>
                  <div className="text-sm font-medium">
                    {osInfo.distro || osInfo.type}
                    {osInfo.distroVersion && ` ${osInfo.distroVersion}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <CpuIcon className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Процессор</div>
                  <div className="text-sm font-medium truncate" title={osInfo.cpuModel}>
                    {osInfo.cpuModel.split(" ").slice(0, 3).join(" ")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <MonitorIcon className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Ядра / Память</div>
                  <div className="text-sm font-medium">
                    {osInfo.cpuCores} / {osInfo.totalMemory.toFixed(0)} GB
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Нет данных об ОС</p>
          )}
        </CardContent>
      </Card>

      {/* CPU and Memory Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPU Usage Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Нагрузка ЦП</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <DonutChart
              value={cpuUsage}
              label="CPU"
              color={cpuUsage > 80 ? "#ef4444" : cpuUsage > 50 ? "#f59e0b" : "#3b82f6"}
              size={250}
            />
          </CardContent>
        </Card>

        {/* Memory Usage Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Загрузка памяти</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <DonutChart
              value={memoryUsage}
              label="RAM"
              color={memoryUsage > 80 ? "#ef4444" : memoryUsage > 50 ? "#f59e0b" : "#8b5cf6"}
              size={250}
            />
          </CardContent>
        </Card>
      </div>

      {/* Disk Usage */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HardDriveIcon className="w-5 h-5 text-muted-foreground" />
            <CardTitle>Дисковое пространство</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {diskUsage.length > 0 ? (
              diskUsage.map((disk, index) => <DiskChart key={index} disk={disk} />)
            ) : (
              <p className="text-muted-foreground text-center py-4">Нет данных о дисках</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Network and Uptime */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Network Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <NetworkIconLucide className="w-5 h-5 text-muted-foreground" />
              <CardTitle>Сеть</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {network ? (
              <NetworkChart network={network} />
            ) : (
              <p className="text-muted-foreground text-center py-4">Нет данных о сети</p>
            )}
          </CardContent>
        </Card>

        {/* Uptime Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-muted-foreground" />
              <CardTitle>Время работы</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-4xl font-bold text-green-600">{formattedUptime || "0 мин."}</div>
            <p className="text-sm text-muted-foreground mt-2">Сервер работает</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date().toLocaleString("ru-RU")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-8 left-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md">
        <Link to="/">
          <Button type="button" className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900">
            <HomeIcon className="w-4 h-4" />
          </Button>
        </Link>

        <Button
          onClick={refresh}
          disabled={isLoading}
          type="button"
          className="px-3 py-4 bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>Обновить</span>
        </Button>
      </div>
    </div>
  );
};
