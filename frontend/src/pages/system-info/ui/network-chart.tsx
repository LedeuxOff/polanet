import { NetworkInfo } from "@/lib/api/system-info-api";
import { NetworkIcon, UploadIcon, DownloadIcon } from "lucide-react";

interface NetworkChartProps {
  network: NetworkInfo;
}

export const NetworkChart = ({ network }: NetworkChartProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <NetworkIcon className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium">{network.interfaceName}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Upload */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <div className="p-2 bg-blue-100 rounded-full">
            <UploadIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Отдача</div>
            <div className="text-sm font-bold text-blue-600">{network.bytesSentFormatted}</div>
          </div>
        </div>

        {/* Download */}
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
          <div className="p-2 bg-green-100 rounded-full">
            <DownloadIcon className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Загрузка</div>
            <div className="text-sm font-bold text-green-600">{network.bytesReceivedFormatted}</div>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <div>IP: {network.ip}</div>
        <div>MAC: {network.mac}</div>
      </div>
    </div>
  );
};
