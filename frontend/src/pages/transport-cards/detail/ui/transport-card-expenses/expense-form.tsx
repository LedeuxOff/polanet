import { BanknoteIcon, CreditCardIcon, Loader2Icon, PlusIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-picker";
import { ExpensePaymentType } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ExpenseFormProps {
  expensePaymentType: ExpensePaymentType;
  setExpensePaymentType: Dispatch<SetStateAction<ExpensePaymentType>>;
  expenseAmount: string;
  setExpenseAmount: Dispatch<SetStateAction<string>>;
  expenseDateTime: string;
  setExpenseDateTime: Dispatch<SetStateAction<string>>;
}

const PAYMENT_TYPES = [
  { id: "cash", label: "Наличные", Icon: BanknoteIcon },
  { id: "bank_transfer", label: "Безналичные", Icon: CreditCardIcon },
] as const;

const QUICK_AMOUNTS = [1000, 2000, 3000, 5000];

/** Поля формы расхода — общие для модалки и шторки */
export const ExpenseFormFields = ({
  expensePaymentType,
  setExpensePaymentType,
  expenseAmount,
  setExpenseAmount,
  expenseDateTime,
  setExpenseDateTime,
}: ExpenseFormProps) => (
  <div className="flex flex-col gap-5">
    {/* Сумма */}
    <div className="flex flex-col gap-2">
      <Label htmlFor="expenseAmount">Сумма</Label>
      <div className="flex h-16 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition-colors focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 dark:border-white/20 dark:bg-white/5 dark:focus-within:border-blue-400/60 dark:focus-within:bg-white/10 dark:focus-within:ring-blue-400/20">
        <input
          id="expenseAmount"
          type="number"
          inputMode="decimal"
          min={0}
          value={expenseAmount}
          onChange={(e) => setExpenseAmount(e.target.value)}
          placeholder="0"
          className="w-full min-w-0 bg-transparent text-3xl font-bold tabular-nums text-slate-900 outline-none placeholder:text-slate-300 [appearance:textfield] dark:text-slate-100 dark:placeholder:text-slate-600 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="text-2xl font-semibold text-slate-400">₽</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => setExpenseAmount(String(amount))}
            className={cn(
              "h-8 rounded-xl px-3 text-xs font-medium tabular-nums transition-colors",
              expenseAmount === String(amount)
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20",
            )}
          >
            {amount.toLocaleString("ru-RU")} ₽
          </button>
        ))}
      </div>
    </div>

    {/* Способ оплаты */}
    <div className="flex flex-col gap-2">
      <Label>Способ оплаты</Label>
      <div className="grid grid-cols-2 gap-2">
        {PAYMENT_TYPES.map(({ id, label, Icon }) => {
          const active = expensePaymentType === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setExpensePaymentType(id)}
              aria-pressed={active}
              className={cn(
                "flex h-12 items-center justify-center gap-2 rounded-2xl border text-sm font-medium transition-all",
                active
                  ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100 dark:border-blue-400/60 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-400/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-white/20 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/30",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>
    </div>

    {/* Дата и время */}
    <div className="flex flex-col gap-2">
      <Label htmlFor="expenseDateTime">Дата и время</Label>
      <DateTimePicker
        id="expenseDateTime"
        value={expenseDateTime}
        onChange={setExpenseDateTime}
        inModal
        className="h-12"
      />
    </div>
  </div>
);

export const ExpenseSubmitButton = ({
  onClick,
  isLoading,
  disabled,
  className,
}: {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-medium text-white shadow-sm shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 dark:bg-blue-500/80 dark:shadow-none dark:hover:bg-blue-500",
      className,
    )}
  >
    {isLoading ? (
      <Loader2Icon className="h-4 w-4 animate-spin" />
    ) : (
      <PlusIcon className="h-4 w-4" />
    )}
    {isLoading ? "Добавление..." : "Добавить расход"}
  </button>
);

export const ExpenseCancelButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 px-6 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/20"
  >
    Отмена
  </button>
);
