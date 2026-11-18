import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

export const AddExpenseDesktopModal = ({
  showExpenseDialog,
  setShowExpenseDialog,
  handleAddExpense,
  isAddingExpense,
  ...form
}: Props) => (
  <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
    <DialogContent className="gap-6 !rounded-3xl border-slate-200 p-6 sm:max-w-[460px] dark:border-white/20 dark:bg-zinc-900/80 dark:backdrop-blur-xl">
      <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-400/15 dark:text-red-300">
          <ReceiptIcon className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-0.5">
          <DialogTitle className="text-base">Новый расход</DialogTitle>
          <span className="text-sm text-slate-500 dark:text-slate-300">
            Списание по топливной карте
          </span>
        </div>
      </DialogHeader>

      <ExpenseFormFields {...form} />

      <div className="flex gap-2">
        <ExpenseCancelButton onClick={() => setShowExpenseDialog(false)} />
        <ExpenseSubmitButton
          onClick={handleAddExpense}
          isLoading={isAddingExpense}
          disabled={isAddingExpense || !form.expenseAmount}
          className="flex-1"
        />
      </div>
    </DialogContent>
  </Dialog>
);
