import { Breadcrumbs } from "@/components/breadcrumbs";
import { DetailPageHead } from "@/components/data-list";
import { CreditCardIcon } from "lucide-react";

export const CardNewPageHead = () => (
  <DetailPageHead
    breadcrumbs={
      <Breadcrumbs
        items={[
          { label: "Топливные карты", href: "/transport-cards", active: false },
          { label: "Создание", active: true },
        ]}
      />
    }
    icon={<CreditCardIcon />}
    iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300"
    title="Новая карта"
  />
);
