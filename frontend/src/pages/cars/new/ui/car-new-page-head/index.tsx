import { Breadcrumbs } from "@/components/breadcrumbs";
import { DetailPageHead } from "@/components/data-list";
import { CarFrontIcon } from "lucide-react";

export const CarNewPageHead = () => (
  <DetailPageHead
    breadcrumbs={
      <Breadcrumbs
        items={[
          { label: "Автомобили", href: "/cars", active: false },
          { label: "Создание", active: true },
        ]}
      />
    }
    icon={<CarFrontIcon />}
    iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300"
    title="Новый автомобиль"
  />
);
