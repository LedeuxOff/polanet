import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpensePaymentType } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";

interface Props {
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
}

export const AddExpenseMobileModal = ({
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
}: Props) => {
  return (
    <Drawer open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
      <DrawerContent className="dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
        <DrawerHeader>
          <DrawerTitle>Добавить расход</DrawerTitle>
        </DrawerHeader>
        <div className="pb-8 flex flex-col gap-4">
          <div className="space-y-4">
            {/* Тип оплаты */}
            <div className="space-y-2">
              <Label htmlFor="expensePaymentType">Тип оплаты</Label>
              <Select
                value={expensePaymentType}
                onValueChange={(value: ExpensePaymentType) => setExpensePaymentType(value)}
              >
                <SelectTrigger className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
                  <SelectValue placeholder="Выберите тип оплаты" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
                  <SelectItem value="cash">Наличные</SelectItem>
                  <SelectItem value="bank_transfer">Безналичные</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Сумма расхода */}
            <div className="space-y-2">
              <Label htmlFor="expenseAmount">Сумма расхода (₽)</Label>
              <Input
                className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
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
                className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
                id="expenseDateTime"
                type="datetime-local"
                value={expenseDateTime}
                onChange={(e) => setExpenseDateTime(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              className="rounded-2xl dark:bg-blue-600/40 dark:hover:bg-blue-600/30 dark:text-white"
              onClick={handleAddExpense}
              disabled={isAddingExpense || !expenseAmount}
            >
              {isAddingExpense ? "Добавление..." : "Добавить"}
            </Button>
            <Button
              className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20sw"
              variant="outline"
              onClick={() => setShowExpenseDialog(false)}
            >
              Отмена
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
