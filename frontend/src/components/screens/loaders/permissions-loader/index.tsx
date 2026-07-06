import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from "lucide-react";

export const PermissionsLoader = () => {
  return (
    <Skeleton className="h-32 rounded-2xl flex justify-center items-center bg-white shadow-xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
      <div className="flex flex-col gap-4 items-center">
        Загрузка прав доступа...
        <Loader className="animate-spin" />
      </div>
    </Skeleton>
  );
};
