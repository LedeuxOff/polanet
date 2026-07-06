import { ExpensePaymentType, TransportCard, TransportCardForm } from "@/lib/types";
import { TransportCardMainInfo } from "./transport-card-main-info";
import { UseFormReturn } from "react-hook-form";
import { TransportCardExpenses } from "./transport-card-expenses";
import { Dispatch, SetStateAction } from "react";
import { TransportCardHistory } from "./transport-card-history";

interface Props {
  isSubmitting: boolean;
  form: UseFormReturn<TransportCardForm>;
  card: TransportCard;
  openExpenseDialog: () => void;
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
  isRoleAdminOrDeveloper: boolean;
}

export const TransportCardPageForm = ({
  isSubmitting,
  form,
  card,
  openExpenseDialog,
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
  isRoleAdminOrDeveloper,
}: Props) => {
  const totalExpenses = card?.totalExpenses || 0;

  return (
    <>
      <TransportCardMainInfo isSubmitting={isSubmitting} form={form} card={card} />

      <div className="flex flex-col gap-4 flex-1">
        {hasPermission("expenses:list") && (
          <TransportCardExpenses
            totalExpenses={totalExpenses}
            openExpenseDialog={openExpenseDialog}
            card={card}
            handleRemoveExpense={handleRemoveExpense}
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
            hasPermission={hasPermission}
            showToast={showToast}
          />
        )}

        {isRoleAdminOrDeveloper && <TransportCardHistory card={card} />}
      </div>
    </>
  );
};
