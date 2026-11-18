import { Breadcrumbs } from "@/components/breadcrumbs";
import { DetailPageHead } from "@/components/data-list";
import { UserPlusIcon } from "lucide-react";

export const ClientNewPageHead = () => (
  <DetailPageHead
    breadcrumbs={
      <Breadcrumbs
        items={[
          { label: "Клиенты", href: "/clients", active: false },
          { label: "Создание", active: true },
        ]}
      />
    }
    icon={<UserPlusIcon />}
    iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300"
    title="Новый клиент"
  />
);
