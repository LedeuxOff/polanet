import { Order } from "@/lib/types";
import {
  Dispatch,
  SetStateAction,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { ReceiptIcon } from "lucide-react";
import { useOrderPayments } from "./hooks";
import { useIsMobile } from "@/hooks";
import { cn } from "@/lib/utils";
import { PaymentAddMobileModal } from "./ui/payment-add-mobile-modal";
import { PaymentAddDesktopModal } from "./ui/payment-add-desktop-modal";
import { PaymentItemMobile } from "./ui/payment-item-mobile";
import { PaymentItemDesktop } from "./ui/payment-item-desktop";
import { FinanceSummary } from "./ui/finance-summary";
import { ListPagination } from "../shared/list-pagination";

interface Props {
  orderId: string;
  order: Order | null;
  setOrder: Dispatch<SetStateAction<Order | null>>;
}

export interface OrderPaymentsHandle {
  openIncomeDialog: () => void;
}

type IncomeFilter = "all" | "prepayment" | "delivery_payment";

const filters: { value: IncomeFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "prepayment", label: "Предоплаты" },
  { value: "delivery_payment", label: "Оплаты доставок" },
];

const ITEMS_PER_PAGE = 8;

export const OrderPayments = forwardRef<OrderPaymentsHandle, Props>(
  ({ orderId, order, setOrder }, ref) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState<IncomeFilter>("all");

    const isMobile = useIsMobile();

    const {
      receivedAmount,
      pendingAmount,
      customerDebt,
      companyDebt,
      incomes,
      openIncomeDialog,
      showIncomeDialog,
      setShowIncomeDialog,
      incomeForm,
      handleAddIncome,
      error,
      handleCancelIncome,
      isAddingIncome,
    } = useOrderPayments({ orderId, order, setOrder });

    useImperativeHandle(ref, () => ({ openIncomeDialog }));

    const sortedIncomes = useMemo(
      () =>
        [...incomes].sort(
          (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
        ),
      [incomes],
    );

    const counts = useMemo(
      () => ({
        all: incomes.length,
        prepayment: incomes.filter((i) => i.incomeType === "prepayment").length,
        delivery_payment: incomes.filter((i) => i.incomeType === "delivery_payment").length,
      }),
      [incomes],
    );

    const filtered = useMemo(
      () =>
        filter === "all" ? sortedIncomes : sortedIncomes.filter((i) => i.incomeType === filter),
      [sortedIncomes, filter],
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

    useEffect(() => {
      setCurrentPage(1);
    }, [filter]);

    useEffect(() => {
      if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    const paginatedIncomes = useMemo(() => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, currentPage]);

    return (
      <>
        <div className="flex flex-col gap-5">
          <FinanceSummary
            receivedAmount={receivedAmount}
            pendingAmount={pendingAmount}
            customerDebt={customerDebt}
            companyDebt={companyDebt}
            isMobile={isMobile}
          />

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">Доходы</p>

            {incomes.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-4 py-10 text-center dark:border-white/20">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground dark:bg-white/10">
                  <ReceiptIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">Доходов пока нет</p>
                  <p className="text-sm text-muted-foreground">
                    Нажмите «Добавить» в нижней панели
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                  {filters.map(({ value, label }) => {
                    const active = filter === value;
                    const count = counts[value];
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFilter(value)}
                        disabled={value !== "all" && count === 0}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors disabled:pointer-events-none disabled:opacity-40 dark:border-white/20",
                          active
                            ? "border-transparent bg-blue-600 text-white dark:bg-blue-600/60"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-white/10",
                        )}
                      >
                        {label}
                        <span
                          className={cn(
                            "rounded-full px-1.5 text-xs",
                            active ? "bg-white/20" : "bg-muted dark:bg-white/10",
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="divide-y overflow-hidden rounded-2xl border dark:divide-white/10 dark:border-white/20">
                  {paginatedIncomes.map((income) =>
                    isMobile ? (
                      <PaymentItemMobile key={income.id} income={income} />
                    ) : (
                      <PaymentItemDesktop key={income.id} income={income} />
                    ),
                  )}
                </div>

                {totalPages > 1 && (
                  <ListPagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                    totalItems={filtered.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    compact={isMobile}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Модальное окно добавления дохода */}
        {isMobile && (
          <PaymentAddMobileModal
            showIncomeDialog={showIncomeDialog}
            setShowIncomeDialog={setShowIncomeDialog}
            form={incomeForm}
            handleAddIncome={handleAddIncome}
            error={error}
            handleCancelIncome={handleCancelIncome}
            isAddingIncome={isAddingIncome}
          />
        )}

        {!isMobile && (
          <PaymentAddDesktopModal
            showIncomeDialog={showIncomeDialog}
            setShowIncomeDialog={setShowIncomeDialog}
            form={incomeForm}
            handleAddIncome={handleAddIncome}
            error={error}
            handleCancelIncome={handleCancelIncome}
            isAddingIncome={isAddingIncome}
          />
        )}
      </>
    );
  },
);

OrderPayments.displayName = "OrderPayments";
