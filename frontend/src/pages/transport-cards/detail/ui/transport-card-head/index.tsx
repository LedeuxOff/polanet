import { Breadcrumbs } from "@/components/breadcrumbs";
import { DetailPageHead, HeadChip } from "@/components/data-list";
import { TransportCard } from "@/lib/types";
import { getFormattedAmount } from "@/lib/utils";
import { CreditCardIcon, ReceiptIcon } from "lucide-react";
import { CardStatusBadge, formatCardNumber } from "../../../ui/card-identity";

export const TransportCardPageHead = ({ card }: { card: TransportCard }) => (
  <DetailPageHead
    breadcrumbs={
      <Breadcrumbs
        items={[
          { label: "Топливные карты", active: false, href: "/transport-cards" },
          { label: `Карта ${formatCardNumber(card?.cardNumber)}`, active: true },
        ]}
      />
    }
    icon={<CreditCardIcon />}
    iconClassName={
      card.status === "active"
        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300"
        : undefined
    }
    title={<span className="font-mono tracking-wide">{formatCardNumber(card.cardNumber)}</span>}
    badges={<CardStatusBadge status={card.status} />}
    chips={
      <HeadChip icon={<ReceiptIcon />}>
        Расходы: {getFormattedAmount(card.totalExpenses || 0)} ₽ · {card.expenses?.length ?? 0} шт.
      </HeadChip>
    }
  />
);
