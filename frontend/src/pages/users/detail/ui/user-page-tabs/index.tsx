import { useIsMobile } from "@/hooks";
import { FileText, Truck } from "lucide-react";
import { SetStateAction } from "react";

interface Props {
  activeTab: string;
  setActiveTab: (value: SetStateAction<string>) => void;
}

export const UserPageTabs = ({ activeTab, setActiveTab }: Props) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex gap-1 p-1.5 bg-white border border-zinc-200 rounded-2xl shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <button
        type="button"
        onClick={() => setActiveTab("details")}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${
          activeTab === "details"
            ? "bg-blue-500 text-white shadow-md dark:bg-white/10"
            : "text-zinc-600 dark:text-zinc-200 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-white/10"
        }`}
      >
        <FileText className="w-4 h-4" />
        <span className={!isMobile ? "" : "hidden"}>Основная информация</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("transport-card")}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${
          activeTab === "transport-card"
            ? "bg-blue-500 text-white shadow-md dark:bg-white/10"
            : "text-zinc-600 dark:text-zinc-200 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-white/10"
        }`}
      >
        <Truck className="w-4 h-4" />
        <span className={!isMobile ? "" : "hidden"}>Транспортная карта</span>
      </button>
    </div>
  );
};
