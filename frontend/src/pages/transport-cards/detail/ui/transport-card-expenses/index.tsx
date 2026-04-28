import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ExpensePaymentType, TransportCard } from "@/lib/types";
import { useState, useMemo, Dispatch, SetStateAction } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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

const ITEMS_PER_PAGE = 3;

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

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil((card?.expenses?.length || 0) / ITEMS_PER_PAGE));
  }, [card?.expenses?.length]);

  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return (card?.expenses || []).slice(start, start + ITEMS_PER_PAGE);
  }, [card?.expenses, currentPage]);

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

  const hasExpensesCreatePermission = hasPermission("expenses:create");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Общая сумма расходов</p>
        <p className="text-2xl font-bold text-destructive">{totalExpenses} ₽</p>
      </div>

      {/* История расходов */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="expenses">
          <AccordionTrigger className="text-base">
            Расходы ({card?.expenses?.length || 0})
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              {paginatedExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{expense.amount} ₽</p>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span>{expense.expenseType === "salary" ? "Зарплата" : "Топливо"}</span>
                      <span>•</span>
                      <span>{expense.paymentType === "cash" ? "Наличные" : "Безналичные"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(expense.dateTime).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveExpense(expense.id)}>
                    Удалить
                  </Button>
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

      {/* Кнопка добавления расхода */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            if (!hasExpensesCreatePermission) {
              showToast("У вас нет прав на добавление расходов", "error");
              return;
            }
            openExpenseDialog();
          }}
          variant="outline"
          type="button"
          className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
        >
          Добавить расход
        </Button>
      </div>

      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить расход</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Тип оплаты */}
            <div className="space-y-2">
              <Label htmlFor="expensePaymentType">Тип оплаты</Label>
              <Select
                value={expensePaymentType}
                onValueChange={(value: ExpensePaymentType) => setExpensePaymentType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип оплаты" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Наличные</SelectItem>
                  <SelectItem value="bank_transfer">Безналичные</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Сумма расхода */}
            <div className="space-y-2">
              <Label htmlFor="expenseAmount">Сумма расхода (₽)</Label>
              <Input
                id="expenseAmount"
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="1000"
              />
            </div>

            {/* Дата и время */}
            <div className="space-y-2">
              <Label htmlFor="expenseDateTime">Дата и время</Label>
              <Input
                id="expenseDateTime"
                type="datetime-local"
                value={expenseDateTime}
                onChange={(e) => setExpenseDateTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddExpense} disabled={isAddingExpense || !expenseAmount}>
              {isAddingExpense ? "Добавление..." : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
