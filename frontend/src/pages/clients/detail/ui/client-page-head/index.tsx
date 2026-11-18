import { Breadcrumbs } from "@/components/breadcrumbs";
import { DetailPageHead, HeadChip } from "@/components/data-list";
import { Client } from "@/lib/types";
import { formatPhoneDisplay } from "@/lib/utils/phone";
import { Building2Icon, MailIcon, PhoneIcon, UserIcon } from "lucide-react";
import { ClientTypeBadge, getClientName } from "../../../ui/client-identity";

export const ClientPageHead = ({ client }: { client: Client }) => {
  const name = getClientName(client);
  const phone = formatPhoneDisplay(client.phone || undefined);
  const isLegal = client.type === "legal";

  return (
    <DetailPageHead
      breadcrumbs={
        <Breadcrumbs
          items={[
            { label: "Клиенты", active: false, href: "/clients" },
            { label: name, active: true },
          ]}
        />
      }
      icon={isLegal ? <Building2Icon /> : <UserIcon />}
      iconClassName={
        isLegal
          ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-300"
          : "bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300"
      }
      title={name}
      badges={<ClientTypeBadge type={client.type} />}
      chips={
        (phone || client.email) && (
          <>
            {phone && <HeadChip icon={<PhoneIcon />}>{phone}</HeadChip>}
            {client.email && <HeadChip icon={<MailIcon />}>{client.email}</HeadChip>}
          </>
        )
      }
    />
  );
};
