import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IncomeForm } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { UseFormReturn } from "react-hook-form";

interface Props {
  showIncomeDialog: boolean;
  setShowIncomeDialog: Dispatch<SetStateAction<boolean>>;
  form: UseFormReturn<IncomeForm>;
  handleAddIncome: (data: IncomeForm) => Promise<void>;
  error: string | null;
  handleCancelIncome: () => void;
  isAddingIncome: boolean;
}

export const PaymentAddDesktopModal = ({
  showIncomeDialog,
  setShowIncomeDialog,
  form,
  handleAddIncome,
  error,
  handleCancelIncome,
  isAddingIncome,
}: Props) => {
  return (
    <Dialog open={showIncomeDialog} onOpenChange={setShowIncomeDialog}>
      <DialogContent className="!rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
        <DialogHeader>
          <DialogTitle>Добавить доход</DialogTitle>
          <DialogDescription>Заполните данные о доходе</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            // Модалка в портале, но submit всплывает до формы заявки — останавливаем
            e.stopPropagation();
            form.handleSubmit(handleAddIncome)(e);
          }}
          className="space-y-4"
        >
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="incomeType">Тип дохода</Label>
            <Select disabled defaultValue="prepayment">
              <SelectTrigger className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
                <SelectItem value="prepayment">Предоплата</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="incomeAmount">Сумма дохода *</Label>
            <Input
              className="rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20"
              id="incomeAmount"
              type="number"
              {...form.register("amount")}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancelIncome}>
              Отмена
            </Button>
            <Button
              type="button"
              disabled={isAddingIncome}
              onClick={form.handleSubmit(handleAddIncome)}
            >
              {isAddingIncome ? "Добавление..." : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
