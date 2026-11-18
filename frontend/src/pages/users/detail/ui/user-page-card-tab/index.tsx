import { BottomBar } from "@/components/bottom-bar";
import { TransportCard, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CreditCardIcon,
  Link2Icon,
  Loader2Icon,
  PlusIcon,
  TruckIcon,
  UnlinkIcon,
} from "lucide-react";
import { ReactNode } from "react";
import { usersCardClass } from "../../../ui/user-identity";

interface Props {
  user: User;
  availableCards: TransportCard[];
  isFetchingCards: boolean;
  handleDetachCard: () => Promise<void>;
  handleAttachCard: (cardId: number) => Promise<void>;
  isDetachingCard: boolean;
  isAttachingCard: boolean;
}

/** Группировка номера по 4 цифры */
const formatCardNumber = (value?: string | null) =>
  (value ?? "").replace(/\s+/g, "").replace(/(.{4})(?=.)/g, "$1 ");

const StatusBadge = ({ active, className }: { active: boolean; className?: string }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
      active
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200"
        : "bg-red-100 text-red-700 dark:bg-red-400/20 dark:text-red-200",
      className,
    )}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {active ? "Активна" : "Неактивна"}
  </span>
);

const EmptyBlock = ({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  action?: ReactNode;
}) => (
  <div className={cn(usersCardClass, "flex flex-col items-center gap-3 px-6 py-12 text-center")}>
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-300 [&>svg]:h-7 [&>svg]:w-7">
      {icon}
    </div>
    <div className="flex max-w-sm flex-col gap-1">
      <span className="font-semibold text-slate-900 dark:text-slate-100">{title}</span>
      <span className="text-sm text-slate-500 dark:text-slate-400">{text}</span>
    </div>
    {action}
  </div>
);

export const UserPageTransportCardTab = ({
  user,
  availableCards,
  isFetchingCards,
  handleDetachCard,
  handleAttachCard,
  isDetachingCard,
  isAttachingCard,
}: Props) => {
  const navigate = useNavigate();
  const bottomBar = <BottomBar hideSaveButton onBack={() => navigate({ to: "/users" })} />;

  const isDriver = user?.roleCode === "DRIVER";

  const currentTransportCard = user?.transportCardId
    ? availableCards.find((card) => card.id === user.transportCardId) || null
    : null;

  const cardNumber = currentTransportCard?.cardNumber || user?.transportCardNumber;
  const isActive = (currentTransportCard?.status || user?.transportCardStatus) === "active";

  if (!isDriver) {
    return (
      <>
        <EmptyBlock
          icon={<TruckIcon />}
          title="Карта недоступна"
          text="Транспортную карту можно привязать только сотруднику с ролью «Водитель»"
        />
        {bottomBar}
      </>
    );
  }

  if (isFetchingCards) {
    return (
      <div className={cn(usersCardClass, "flex flex-col gap-4 p-5 sm:p-6")}>
        <span className="h-5 w-40 animate-pulse rounded-lg bg-slate-200 dark:bg-white/10" />
        <span className="aspect-[1.6] w-full max-w-sm animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10" />
      </div>
    );
  }

  return (
    <>
      {cardNumber ? (
        <div className={cn(usersCardClass, "flex flex-col gap-5 p-5 sm:flex-row sm:p-6")}>
          {/* Визуал карты */}
          <div className="relative flex aspect-[1.6] w-full max-w-sm shrink-0 flex-col justify-between overflow-hidden rounded-3xl border border-blue-100 bg-blue-50 p-5 text-slate-900 dark:border-white/15 dark:bg-white/10 dark:text-white">
            <div className="flex items-start justify-between">
              <div className="h-8 w-11 rounded-md border border-amber-300/60 bg-amber-200 dark:border-transparent dark:bg-amber-300/80" />
              <StatusBadge active={isActive} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Номер карты
              </span>
              <span className="font-mono text-xl font-semibold tracking-wider sm:text-2xl">
                {formatCardNumber(cardNumber)}
              </span>
            </div>
            <span className="truncate text-sm uppercase tracking-wide text-slate-600 dark:text-slate-300">
              {user.lastName} {user.firstName}
            </span>
            <span
              className={cn(
                "absolute bottom-5 right-5 h-2.5 w-2.5 rounded-full",
                isActive ? "bg-emerald-400" : "bg-red-400",
              )}
            />
          </div>

          {/* Информация и действия */}
          <div className="flex flex-1 flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Привязанная карта
              </h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col gap-1 rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                  <dt className="text-xs text-slate-500 dark:text-slate-400">Статус</dt>
                  <dd>
                    <StatusBadge active={isActive} />
                  </dd>
                </div>
                <div className="flex flex-col gap-1 rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                  <dt className="text-xs text-slate-500 dark:text-slate-400">Водитель</dt>
                  <dd className="truncate font-medium text-slate-900 dark:text-slate-100">
                    {user.lastName} {user.firstName?.[0]}.
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-wrap gap-2">
              {user.transportCardId && (
                <Link
                  to="/transport-cards/$cardId"
                  params={{ cardId: String(user.transportCardId) }}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/20"
                >
                  <CreditCardIcon className="h-4 w-4" />
                  Открыть карту
                </Link>
              )}
              <button
                type="button"
                onClick={handleDetachCard}
                disabled={isDetachingCard}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-50 px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-500/20 dark:text-red-200 dark:hover:bg-red-500/30"
              >
                {isDetachingCard ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <UnlinkIcon className="h-4 w-4" />
                )}
                {isDetachingCard ? "Отвязываю..." : "Отвязать карту"}
              </button>
            </div>
          </div>
        </div>
      ) : availableCards.length > 0 ? (
        <div className={cn(usersCardClass, "flex flex-col gap-4 p-5 sm:p-6")}>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Карта не привязана
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-300">
              Выберите свободную карту, чтобы привязать её к сотруднику
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {availableCards.map((card) => (
              <div
                key={card.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition-colors hover:border-slate-300 dark:border-white/15 dark:bg-white/5 dark:hover:border-white/25"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300">
                  <CreditCardIcon className="h-5 w-5" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatCardNumber(card.cardNumber)}
                  </span>
                  <StatusBadge active={card.status === "active"} className="w-fit py-0.5" />
                </div>
                <button
                  type="button"
                  onClick={() => handleAttachCard(card.id)}
                  disabled={isAttachingCard}
                  title="Привязать"
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500/80 dark:hover:bg-blue-500"
                >
                  {isAttachingCard ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link2Icon className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Привязать</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyBlock
          icon={<CreditCardIcon />}
          title="Нет свободных карт"
          text="Все транспортные карты уже привязаны к сотрудникам. Создайте новую карту."
          action={
            <Link
              to="/transport-cards/new"
              className="mt-1 inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <PlusIcon className="h-4 w-4" />
              Создать карту
            </Link>
          }
        />
      )}

      {bottomBar}
    </>
  );
};
