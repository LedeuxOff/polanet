import { Breadcrumbs } from "@/components/breadcrumbs";
import { DetailPageHead, HeadChip } from "@/components/data-list";
import { Car } from "@/lib/types";
import { CalendarIcon, CarFrontIcon } from "lucide-react";
import { LicensePlate } from "../../../ui/license-plate";

export const CarPageHead = ({ car }: { car: Car }) => {
  const createdDate = car.createdAt ? new Date(car.createdAt) : null;
  const created =
    createdDate && !Number.isNaN(createdDate.getTime())
      ? createdDate.toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;

  return (
    <DetailPageHead
      breadcrumbs={
        <Breadcrumbs
          items={[
            { label: "Автомобили", active: false, href: "/cars" },
            { label: car.brand, active: true },
          ]}
        />
      }
      icon={<CarFrontIcon />}
      iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300"
      title={car.brand}
      badges={<LicensePlate value={car.licensePlate} size="sm" />}
      chips={created && <HeadChip icon={<CalendarIcon />}>Добавлен {created}</HeadChip>}
    />
  );
};
