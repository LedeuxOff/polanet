import { ChevronRightIcon } from "lucide-react";
import { useIsMobile } from "@/hooks";
import { TransportCard } from "@/lib/types";
import { cn, getFormattedAmount } from "@/lib/utils";
import {
  listCardClass,
  ListEmptyState,
  listTdClass as td,
  listThClass as th,
  Shimmer,
} from "@/components/data-list";
import { CardStatusBadge, formatCardNumber, FuelCardIcon } from "../../../ui/card-identity";

type Row = TransportCard & { totalExpenses?: number };

interface Props {
  cards: Row[];
  isLoading: boolean;
  skeletonCount?: number;
  onOpen: (card: Row) => void;
}

const Amount = ({ value }: { value?: number }) =>
  value && value > 0 ? (
    <span className="whitespace-nowrap font-semibold tabular-nums text-red-600 dark:text-red-300">
      {getFormattedAmount(value)} ₽
    </span>
  ) : (
    <span className="text-slate-400 dark:text-slate-500">0 ₽</span>
  );

const emptyText = "Попробуйте изменить номер карты";

const MobileList = ({ cards, isLoading, skeletonCount = 5, onOpen }: Props) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className={cn(listCardClass, "flex items-center gap-3 p-4")}>
            <Shimmer className="h-11 w-11 rounded-2xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Shimmer className="h-4 w-2/3" />
              <Shimmer className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!cards.length) return <ListEmptyState text={emptyText} />;

  return (
    <div className="flex flex-col gap-3">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={() => onOpen(card)}
          className={cn(
            listCardClass,
            "flex items-center gap-3 p-4 text-left transition-all active:scale-[0.99] hover:border-slate-300 dark:hover:bg-white/15",
          )}
        >
          <FuelCardIcon status={card.status} className="h-11 w-11 rounded-2xl" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="truncate font-mono font-semibold tracking-wide text-slate-900 dark:text-slate-100">
              {formatCardNumber(card.cardNumber)}
            </span>
            <CardStatusBadge status={card.status} />
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Расходы</span>
            <Amount value={card.totalExpenses} />
          </div>
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-500" />
        </button>
      ))}
    </div>
  );
};

const DesktopTable = ({ cards, isLoading, skeletonCount = 5, onOpen }: Props) => {
  if (!isLoading && !cards.length) return <ListEmptyState text={emptyText} />;

  return (
    <div className={cn(listCardClass, "overflow-hidden")}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-white/15 dark:bg-white/5">
            <tr>
              <th className={th}>Карта</th>
              <th className={th}>Статус</th>
              <th className={cn(th, "text-right")}>Общие расходы</th>
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
                        <Shimmer className="h-4 w-44" />
                      </div>
                    </td>
                    <td className={td}>
                      <Shimmer className="h-6 w-24 rounded-full" />
                    </td>
                    <td className={td}>
                      <Shimmer className="ml-auto h-4 w-20" />
                    </td>
                    <td />
                  </tr>
                ))
              : cards.map((card) => (
                  <tr
                    key={card.id}
                    onClick={() => onOpen(card)}
                    className="group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/10"
                  >
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <FuelCardIcon status={card.status} className="h-9 w-9 rounded-xl" />
                        <span className="whitespace-nowrap font-mono font-semibold tracking-wide text-slate-900 dark:text-slate-100">
                          {formatCardNumber(card.cardNumber)}
                        </span>
                      </div>
                    </td>
                    <td className={td}>
                      <CardStatusBadge status={card.status} />
                    </td>
                    <td className={cn(td, "text-right")}>
                      <Amount value={card.totalExpenses} />
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

export const CardsTable = (props: Props) => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileList {...props} /> : <DesktopTable {...props} />;
};
