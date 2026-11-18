import { ExpensePaymentType, TransportCard } from "@/lib/types";
import { useState, useMemo, Dispatch, SetStateAction } from "react";
import { FuelIcon, PlusIcon, ReceiptIcon, Trash2Icon, WalletIcon } from "lucide-react";
import { useIsMobile } from "@/hooks";
import { cn, getFormattedAmount } from "@/lib/utils";
import { MiniPager } from "@/components/data-list";
import { AddExpenseDesktopModal } from "./add-expense-desktop-modal";
import { AddExpenseMobileModal } from "./add-expense-mobile-modal";

interface Props {
  totalExpenses: number;
  openExpenseDialog: () => void;
  card: TransportCard | null;
  handleRemoveExpense: (expenseId: number) => Promise<void>;
  showExpenseDialog: boolean;
  setShowExpenseDialog: Dispatch<SetStateAction<boolean>>;
  expensePaymentType: ExpensePaymentType;
  setExpensePaymentType: Dispatch<SetStateAction<ExpensePaymentType>>;
  expenseAmount: string;
  setExpenseAmount: Dispatch<SetStateAction<string>>;
  expenseDateTime: string;
  setExpenseDateTime: Dispatch<SetStateAction<string>>;
  handleAddExpense: () => Promise<void>;
  isAddingExpense: boolean;
  hasPermission: (permission: string) => boolean;
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

const ITEMS_PER_PAGE = 5;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });

export const TransportCardExpenses = ({
  totalExpenses,
  openExpenseDialog,
  card,
  handleRemoveExpense,
  showExpenseDialog,
  setShowExpenseDialog,
  expensePaymentType,
  setExpensePaymentType,
  expenseAmount,
  setExpenseAmount,
  expenseDateTime,
  setExpenseDateTime,
  handleAddExpense,
  isAddingExpense,
  hasPermission,
  showToast,
}: Props) => {
  const [currentPage, setCurrentPage] = useState(1);

  const isMobile = useIsMobile();

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil((card?.expenses?.length || 0) / ITEMS_PER_PAGE));
  }, [card?.expenses?.length]);

  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return (card?.expenses || []).slice(start, start + ITEMS_PER_PAGE);
  }, [card?.expenses, currentPage]);

  const hasExpensesCreatePermission = hasPermission("expenses:create");
  const expenses = card?.expenses || [];
  const lastExpense = expenses.reduce<(typeof expenses)[number] | null>(
    (latest, e) => (!latest || new Date(e.paymentDate) > new Date(latest.paymentDate) ? e : latest),
    null,
  );

  return (
    <div className="col-span-full flex flex-col gap-4">
      {/* Сводка */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="col-span-2 flex flex-col gap-1 rounded-2xl border border-red-100 bg-red-50 p-4 sm:col-span-1 dark:border-red-400/20 dark:bg-red-500/10">
          <span className="text-xs font-medium text-red-700/80 dark:text-red-200/80">
            Общая сумма
          </span>
          <span className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-300">
            {getFormattedAmount(totalExpenses)} ₽
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/15 dark:bg-white/5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Операций</span>
          <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {expenses.length}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/15 dark:bg-white/5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Последний</span>
          <span className="text-base font-semibold leading-8 text-slate-900 dark:text-slate-100">
            {lastExpense ? formatDate(lastExpense.paymentDate) : "—"}
          </span>
        </div>
      </div>

      {/* Список */}
      {expenses.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center dark:border-white/20">
          <ReceiptIcon className="h-6 w-6 text-slate-300 dark:text-slate-500" />
          <span className="text-sm text-slate-500 dark:text-slate-400">Расходов пока нет</span>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 dark:divide-white/10 dark:border-white/15">
          {paginatedExpenses.map((expense) => {
            const isFuel = expense.expenseType !== "salary";
            return (
              <div key={expense.id} className="flex items-center gap-3 px-4 py-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    isFuel
                      ? "bg-orange-100 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300"
                      : "bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300",
                  )}
                >
                  {isFuel ? <FuelIcon className="h-5 w-5" /> : <WalletIcon className="h-5 w-5" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {isFuel ? "Топливо" : "Зарплата"}
                  </span>
                  <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(expense.paymentDate)} ·{" "}
                    {expense.paymentType === "cash" ? "Наличные" : "Безналичные"}
                  </span>
                </div>
                <span className="whitespace-nowrap font-semibold tabular-nums text-red-600 dark:text-red-300">
                  −{getFormattedAmount(expense.amount)} ₽
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveExpense(expense.id)}
                  title="Удалить расход"
                  aria-label="Удалить расход"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-200"
                >
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
        <MiniPager page={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
        <button
          type="button"
          onClick={() => {
            if (!hasExpensesCreatePermission) {
              showToast("У вас нет прав на добавление расходов", "error");
              return;
            }
            openExpenseDialog();
          }}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:ml-auto sm:w-auto dark:bg-blue-500/80 dark:hover:bg-blue-500"
        >
          <PlusIcon className="h-4 w-4" />
          Добавить расход
        </button>
      </div>

      {isMobile && (
        <AddExpenseMobileModal
          showExpenseDialog={showExpenseDialog}
          setShowExpenseDialog={setShowExpenseDialog}
          expensePaymentType={expensePaymentType}
          setExpensePaymentType={setExpensePaymentType}
          expenseAmount={expenseAmount}
          setExpenseAmount={setExpenseAmount}
          expenseDateTime={expenseDateTime}
          setExpenseDateTime={setExpenseDateTime}
          handleAddExpense={handleAddExpense}
          isAddingExpense={isAddingExpense}
        />
      )}

      {!isMobile && (
        <AddExpenseDesktopModal
          showExpenseDialog={showExpenseDialog}
          setShowExpenseDialog={setShowExpenseDialog}
          expensePaymentType={expensePaymentType}
          setExpensePaymentType={setExpensePaymentType}
          expenseAmount={expenseAmount}
          setExpenseAmount={setExpenseAmount}
          expenseDateTime={expenseDateTime}
          setExpenseDateTime={setExpenseDateTime}
          handleAddExpense={handleAddExpense}
          isAddingExpense={isAddingExpense}
        />
      )}
    </div>
  );
};
