import { Breadcrumbs } from "@/components/breadcrumbs";
import { DetailPageHead, HeadChip } from "@/components/data-list";
import type { ScreedClient } from "@/lib/types";
import { formatPhoneDisplay } from "@/lib/utils/phone";
import { PhoneIcon, UserRoundIcon, UserRoundPlusIcon } from "lucide-react";
import { getScreedClientName } from "../../shared";
import { WorksCountBadge } from "../../ui/screed-client-identity";

const tone = "bg-teal-100 text-teal-600 dark:bg-teal-400/15 dark:text-teal-300";

export const ScreedClientPageHead = ({ client }: { client?: ScreedClient | null }) => {
  const isNew = !client;
  const name = client ? getScreedClientName(client) : "Новый клиент";
  const phone = client ? formatPhoneDisplay(client.phone) : "";

  return (
    <DetailPageHead
      breadcrumbs={
        <Breadcrumbs
          items={[
            { label: "Клиенты стяжки", href: "/screed-clients", active: false },
            { label: isNew ? "Создание" : name, active: true },
          ]}
        />
      }
      icon={isNew ? <UserRoundPlusIcon /> : <UserRoundIcon />}
      iconClassName={tone}
      title={name}
      badges={client && <WorksCountBadge count={client.worksCount} />}
      chips={phone && <HeadChip icon={<PhoneIcon />}>{phone}</HeadChip>}
    />
  );
};
