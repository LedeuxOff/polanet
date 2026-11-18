import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Dispatch, SetStateAction } from "react";
import { ReceiptIcon } from "lucide-react";
import {
  ExpenseCancelButton,
  ExpenseFormFields,
  ExpenseFormProps,
  ExpenseSubmitButton,
} from "./expense-form";

interface Props extends ExpenseFormProps {
  showExpenseDialog: boolean;
  setShowExpenseDialog: Dispatch<SetStateAction<boolean>>;
  handleAddExpense: () => Promise<void>;
  isAddingExpense: boolean;
}

export const AddExpenseMobileModal = ({
  showExpenseDialog,
  setShowExpenseDialog,
  handleAddExpense,
  isAddingExpense,
  ...form
}: Props) => (
  <Drawer open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
    <DrawerContent className="rounded-t-3xl dark:border-white/20 dark:bg-zinc-900/90 dark:backdrop-blur-xl">
      <DrawerHeader className="flex flex-row items-center gap-3 px-5 text-left">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-400/15 dark:text-red-300">
          <ReceiptIcon className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-0.5">
          <DrawerTitle className="text-base">Новый расход</DrawerTitle>
          <span className="text-sm text-slate-500 dark:text-slate-300">
            Списание по топливной карте
          </span>
        </div>
      </DrawerHeader>

      <div className="flex flex-col gap-6 px-5 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <ExpenseFormFields {...form} />
        <div className="flex flex-col-reverse gap-2">
          <ExpenseCancelButton onClick={() => setShowExpenseDialog(false)} />
          <ExpenseSubmitButton
            onClick={handleAddExpense}
            isLoading={isAddingExpense}
            disabled={isAddingExpense || !form.expenseAmount}
          />
        </div>
      </div>
    </DrawerContent>
  </Drawer>
);
