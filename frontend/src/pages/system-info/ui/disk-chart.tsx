import { DiskInfo } from "@/lib/api/system-info-api";

interface DiskChartProps {
  disk: DiskInfo;
}

export const DiskChart = ({ disk }: DiskChartProps) => {
  const getColor = (percent: number) => {
    if (percent > 90) return "#ef4444";
    if (percent > 70) return "#f59e0b";
    return "#10b981";
  };

  const formatGB = (gb: number) => {
    if (gb >= 1024) return `${(gb / 1024).toFixed(1)} TB`;
    return `${gb.toFixed(1)} GB`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{disk.mount}</span>
        <span className="text-muted-foreground">{disk.usagePercent}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${disk.usagePercent}%`,
            backgroundColor: getColor(disk.usagePercent),
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Использовано: {formatGB(disk.used)}</span>
        <span>Свободно: {formatGB(disk.free)}</span>
      </div>
      <div className="text-xs text-muted-foreground">
        Всего: {formatGB(disk.size)} | {disk.type}
      </div>
    </div>
  );
};
