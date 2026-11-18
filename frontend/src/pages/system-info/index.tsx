import {
  ActivityIcon,
  ClockIcon,
  CpuIcon,
  HardDriveIcon,
  LayersIcon,
  MemoryStickIcon,
  MonitorIcon,
  NetworkIcon,
  RefreshCwIcon,
  ServerIcon,
  ServerCrashIcon,
} from "lucide-react";
import { ReactNode } from "react";
import { BottomBar } from "@/components/bottom-bar";
import { listCardClass, ListPageHead, SectionCard, Shimmer } from "@/components/data-list";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import { usePermissions } from "@/lib/contexts/permission-context";
import { cn } from "@/lib/utils";
import { useSystemInfo } from "./hooks";
import { DonutChart } from "./ui/donut-chart";
import { DiskChart, loadTone } from "./ui/disk-chart";
import { NetworkChart } from "./ui/network-chart";

const headTone = "bg-slate-200 text-slate-700 dark:bg-white/15 dark:text-slate-200";

const InfoTile = ({
  icon,
  label,
  value,
  title,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  title?: string;
}) => (
  <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 p-3 dark:border-white/15">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300 [&>svg]:h-5 [&>svg]:w-5">
      {icon}
    </div>
    <div className="flex min-w-0 flex-col">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span
        className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100"
        title={title}
      >
        {value}
      </span>
    </div>
  </div>
);

const Gauge = ({
  title,
  icon,
  value,
  label,
}: {
  title: string;
  icon: ReactNode;
  value: number;
  label: string;
}) => {
  const tone = loadTone(value, 50, 80);
  return (
    <div className={cn(listCardClass, "flex flex-col gap-4 p-5 sm:p-6")}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200 [&>svg]:h-5 [&>svg]:w-5">
            {icon}
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            value > 80
              ? "bg-red-100 text-red-700 dark:bg-red-400/20 dark:text-red-200"
              : value > 50
                ? "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200",
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {tone.label}
        </span>
      </div>
      <div className="flex justify-center py-2">
        <DonutChart value={value} label={label} colorClass={tone.text} />
      </div>
    </div>
  );
};

export const SystemInfoPage = () => {
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
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

  if (isPermissionsLoading) return <PermissionsLoader />;
  if (!hasPermission("system-info:view")) return <NoAccessScreen />;

  const firstLoad = isLoading && !lastUpdated;

  const bottomBar = (
    <BottomBar
      onCreate={refresh}
      createLabel={isLoading ? "Обновление..." : "Обновить"}
      createIcon={<RefreshCwIcon className={cn(isLoading && "animate-spin")} />}
      createDisabled={isLoading}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          listCardClass,
          "flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6",
        )}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
              headTone,
            )}
          >
            <ServerIcon className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
              Информация о системе
            </h1>
            <span className="text-sm text-slate-500 dark:text-slate-300">
              Состояние сервера, обновляется каждые 5 секунд
            </span>
          </div>
        </div>
        {lastUpdated && !error && (
          <span className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Обновлено в <span className="tabular-nums">{lastUpdated}</span>
          </span>
        )}
      </div>

      {error ? (
        <div
          className={cn(listCardClass, "flex flex-col items-center gap-3 px-6 py-12 text-center")}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-400/15 dark:text-red-300">
            <ServerCrashIcon className="h-6 w-6" />
          </div>
          <span className="font-medium text-slate-900 dark:text-slate-100">{error}</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Нажмите «Обновить», чтобы попробовать снова
          </span>
        </div>
      ) : firstLoad ? (
        <>
          <Shimmer className="h-40 w-full rounded-3xl" />
          <div className="grid gap-4 md:grid-cols-2">
            <Shimmer className="h-72 rounded-3xl" />
            <Shimmer className="h-72 rounded-3xl" />
          </div>
        </>
      ) : (
        <>
          <SectionCard
            icon={<MonitorIcon />}
            title="Сервер"
            description="Операционная система и железо"
          >
            {osInfo ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InfoTile icon={<ServerIcon />} label="Платформа" value={osInfo.platform} />
                <InfoTile
                  icon={<LayersIcon />}
                  label="Дистрибутив"
                  value={`${osInfo.distro || osInfo.type}${osInfo.distroVersion ? ` ${osInfo.distroVersion}` : ""}`}
                />
                <InfoTile
                  icon={<CpuIcon />}
                  label="Процессор"
                  value={osInfo.cpuModel}
                  title={osInfo.cpuModel}
                />
                <InfoTile
                  icon={<MemoryStickIcon />}
                  label="Ядра / Память"
                  value={`${osInfo.cpuCores} ядер · ${osInfo.totalMemory.toFixed(0)} ГБ`}
                />
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Нет данных об ОС</p>
            )}
          </SectionCard>

          <div className="grid gap-4 md:grid-cols-2">
            <Gauge
              title="Нагрузка процессора"
              icon={<ActivityIcon />}
              value={cpuUsage}
              label="CPU"
            />
            <Gauge
              title="Использование памяти"
              icon={<MemoryStickIcon />}
              value={memoryUsage}
              label="RAM"
            />
          </div>

          <SectionCard
            icon={<HardDriveIcon />}
            title="Диски"
            description="Занятое и свободное место"
          >
            {diskUsage.length > 0 ? (
              <div className="grid gap-3 lg:grid-cols-2">
                {diskUsage.map((disk, i) => (
                  <DiskChart key={`${disk.mount}-${i}`} disk={disk} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Нет данных о дисках</p>
            )}
          </SectionCard>

          <div className="grid gap-4 md:grid-cols-2">
            <SectionCard icon={<NetworkIcon />} title="Сеть" description="Объём переданных данных">
              {network ? (
                <NetworkChart network={network} />
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">Нет данных о сети</p>
              )}
            </SectionCard>

            <SectionCard icon={<ClockIcon />} title="Время работы" description="Без перезагрузки">
              <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-8 text-center dark:bg-emerald-500/10">
                <span className="text-3xl font-bold tabular-nums text-emerald-700 dark:text-emerald-200 sm:text-4xl">
                  {formattedUptime || "0 мин."}
                </span>
                <span className="text-sm text-emerald-700/70 dark:text-emerald-200/70">
                  Сервер работает
                </span>
              </div>
            </SectionCard>
          </div>
        </>
      )}

      {bottomBar}
    </div>
  );
};
