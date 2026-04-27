import { Income } from "@/lib/types";
import { incomeTypeLabels, paymentMethodLabels } from "../../consts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BadgeRussianRuble, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useMemo } from "react";

interface Props {
  incomes: Income[];
}

const ITEMS_PER_PAGE = 3;

const OrderPaymentsIncomeItemType = ({
  incomeType,
}: {
  incomeType: "prepayment" | "delivery_payment";
}) => <Badge variant="outline">{incomeTypeLabels[incomeType]}</Badge>;

const OrderPaymentsIncomeItemCost = ({
  amount,
  paymentMethod,
}: {
  amount: number;
  paymentMethod: "cash" | "bank_transfer";
}) => {
  const formattedAmount = new Intl.NumberFormat("ru-RU").format(amount);
  return (
    <div className="flex items-center gap-2">
      <BadgeRussianRuble className="w-4 h-4 text-gray-600" />

      <p className="text-gray-600 text-[14px]">{formattedAmount} ₽</p>

      <span className="text-gray-600 text-[14px]">{paymentMethodLabels[paymentMethod]}</span>
    </div>
  );
};

const OrderPaymentsIncomeItemStatus = ({ isPaid }: { isPaid: boolean }) => {
  if (isPaid) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-700">
        Оплачен
      </Badge>
    );
  }

  return <Badge variant="secondary">Не оплачено</Badge>;
};

export const OrderPaymentsIncomeList = ({ incomes }: Props) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(incomes.length / ITEMS_PER_PAGE));
  }, [incomes.length]);

  const paginatedIncomes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return incomes.slice(start, start + ITEMS_PER_PAGE);
  }, [incomes, currentPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="incomes">
          <AccordionTrigger className="text-base">Доходы ({incomes.length})</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              {paginatedIncomes.map((income) => (
                <div key={income.id} className="flex flex-col gap-4 border rounded-md p-4">
                  <div className="flex justify-between gap-4">
                    <div className="flex gap-2 items-center">
                      <OrderPaymentsIncomeItemType incomeType={income.incomeType} />
                      <OrderPaymentsIncomeItemStatus isPaid={income.isPaid} />
                    </div>
                    {income.deliveryId && (
                      <Badge variant="outline">Номер доставки: {income.deliveryId}</Badge>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <OrderPaymentsIncomeItemCost
                      amount={income.amount}
                      paymentMethod={income.paymentMethod}
                    />

                    <div className="flex items-center gap-2 text-[14px] text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{new Date(income.paymentDate).toLocaleDateString("ru-RU")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="h-10 w-10 bg-zinc-800 text-white hover:bg-zinc-900 hover:text-white"
                  type="button"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 px-4 py-2 border rounded-md">
                  <span className="text-sm font-medium">{currentPage}</span>
                  <span className="text-sm text-muted-foreground">/ {totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="h-10 w-10 bg-zinc-800 text-white hover:bg-zinc-900 hover:text-white"
                  type="button"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
