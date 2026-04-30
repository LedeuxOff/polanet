import { Button } from "@/components/ui/button";
import { Order } from "@/lib/types";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { useOrderPayments } from "./hooks";
import { useIsMobile } from "@/hooks";
import { PaymentAddMobileModal } from "./ui/payment-add-mobile-modal";
import { PaymentAddDesktopModal } from "./ui/payment-add-desktop-modal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PaymentItemMobile } from "./ui/payment-item-mobile";
import { PaymentItemDesktop } from "./ui/payment-item-desktop";
import { PaymentsPagination } from "./ui/payments-pagination";

interface Props {
  orderId: string;
  order: Order | null;
  setOrder: Dispatch<SetStateAction<Order | null>>;
}

const ITEMS_PER_PAGE = 3;

export const OrderPayments = ({ orderId, order, setOrder }: Props) => {
  const [currentPage, setCurrentPage] = useState(1);

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

  const paginatedIncomes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return incomes.slice(start, start + ITEMS_PER_PAGE);
  }, [incomes, currentPage]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(incomes.length / ITEMS_PER_PAGE));
  }, [incomes.length]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
          <div className="border rounded-md p-4">
            <p className="text-sm text-muted-foreground">Получено средств</p>
            <p className="text-2xl font-bold text-green-600">{receivedAmount} ₽</p>
          </div>
          <div className="border rounded-md p-4">
            <p className="text-sm text-muted-foreground">Ожидает подтверждения</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingAmount} ₽</p>
          </div>
        </div>

        <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
          <div className="border rounded-md p-4">
            <p className="text-sm text-muted-foreground">Долг клиента</p>
            <p className="text-2xl font-bold text-destructive">{customerDebt} ₽</p>
          </div>
          <div className="border rounded-md p-4">
            <p className="text-sm text-muted-foreground">Долг компании</p>
            <p className="text-2xl font-bold text-orange-600">{companyDebt} ₽</p>
          </div>
          {/* {customerDebt <= 0 && companyDebt <= 0 && (
            <div className="p-4 border rounded-md bg-green-50 col-span-2">
              <p className="text-sm text-muted-foreground">Статус расчетов</p>
              <p className="text-2xl font-bold text-green-600">Все расчеты завершены</p>
            </div>
          )} */}
        </div>

        {/* Доходы */}
        {incomes.length > 0 && (
          <div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="incomes">
                <AccordionTrigger className="text-base">Доходы ({incomes.length})</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-4">
                    {paginatedIncomes.map((income) => {
                      if (isMobile) return <PaymentItemMobile key={income.id} income={income} />;

                      return <PaymentItemDesktop key={income.id} income={income} />;
                    })}
                  </div>

                  {totalPages > 1 && (
                    <PaymentsPagination
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      totalPages={totalPages}
                    />
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        <div className="w-full flex justify-end">
          <Button
            type="button"
            onClick={openIncomeDialog}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={
              order?.status === "completed" ||
              order?.status === "cancelled" ||
              order?.status === "archived"
            }
          >
            Добавить доход
          </Button>
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
};
