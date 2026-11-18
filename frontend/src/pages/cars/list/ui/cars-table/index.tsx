import { CarFrontIcon, ChevronRightIcon } from "lucide-react";
import { useIsMobile } from "@/hooks";
import { Car } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  listCardClass,
  ListEmptyState,
  listTdClass as td,
  listThClass as th,
  Shimmer,
} from "@/components/data-list";
import { LicensePlate } from "../../../ui/license-plate";

interface Props {
  cars: Car[];
  isLoading: boolean;
  skeletonCount?: number;
  onOpen: (car: Car) => void;
}

const formatDate = (value?: string) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
};

const CarIcon = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "flex shrink-0 items-center justify-center bg-orange-100 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300",
      className,
    )}
  >
    <CarFrontIcon className="h-1/2 w-1/2" />
  </div>
);

const MobileList = ({ cars, isLoading, skeletonCount = 5, onOpen }: Props) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className={cn(listCardClass, "flex items-center gap-3 p-4")}>
            <Shimmer className="h-11 w-11 rounded-2xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Shimmer className="h-4 w-1/2" />
              <Shimmer className="h-6 w-28" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!cars.length) return <ListEmptyState text="Попробуйте изменить марку или гос. номер" />;

  return (
    <div className="flex flex-col gap-3">
      {cars.map((car) => (
        <button
          key={car.id}
          type="button"
          onClick={() => onOpen(car)}
          className={cn(
            listCardClass,
            "flex items-center gap-3 p-4 text-left transition-all active:scale-[0.99] hover:border-slate-300 dark:hover:bg-white/15",
          )}
        >
          <CarIcon className="h-11 w-11 rounded-2xl" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
              {car.brand}
            </span>
            <LicensePlate value={car.licensePlate} size="sm" />
          </div>
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-500" />
        </button>
      ))}
    </div>
  );
};

const DesktopTable = ({ cars, isLoading, skeletonCount = 5, onOpen }: Props) => {
  if (!isLoading && !cars.length)
    return <ListEmptyState text="Попробуйте изменить марку или гос. номер" />;

  return (
    <div className={cn(listCardClass, "overflow-hidden")}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-white/15 dark:bg-white/5">
            <tr>
              <th className={th}>Автомобиль</th>
              <th className={th}>Гос. номер</th>
              <th className={th}>Добавлен</th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {isLoading
              ? Array.from({ length: skeletonCount }).map((_, i) => (
                  <tr key={i}>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <Shimmer className="h-9 w-9 rounded-xl" />
                        <Shimmer className="h-4 w-40" />
                      </div>
                    </td>
                    <td className={td}>
                      <Shimmer className="h-7 w-28" />
                    </td>
                    <td className={td}>
                      <Shimmer className="h-4 w-24" />
                    </td>
                    <td />
                  </tr>
                ))
              : cars.map((car) => (
                  <tr
                    key={car.id}
                    onClick={() => onOpen(car)}
                    className="group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/10"
                  >
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <CarIcon className="h-9 w-9 rounded-xl" />
                        <span className="whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                          {car.brand}
                        </span>
                      </div>
                    </td>
                    <td className={td}>
                      <LicensePlate value={car.licensePlate} />
                    </td>
                    <td className={cn(td, "whitespace-nowrap text-slate-600 dark:text-slate-300")}>
                      {formatDate(car.createdAt)}
                    </td>
                    <td className="pr-4 text-right">
                      <ChevronRightIcon className="ml-auto h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-300" />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const CarsTable = (props: Props) => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileList {...props} /> : <DesktopTable {...props} />;
};
