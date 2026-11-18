import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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

export const PaymentAddMobileModal = ({
  showIncomeDialog,
  setShowIncomeDialog,
  form,
  handleAddIncome,
  error,
  handleCancelIncome,
  isAddingIncome,
}: Props) => {
  return (
    <Drawer open={showIncomeDialog} onOpenChange={setShowIncomeDialog}>
      <DrawerContent className="dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20">
        <div className="px-2 py-8 flex-1 max-h-[90vh]">
          <form
            onSubmit={(e) => {
              // Модалка в портале, но submit всплывает до формы заявки — останавливаем
              e.stopPropagation();
              form.handleSubmit(handleAddIncome)(e);
            }}
            className="space-y-4"
          >
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
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

            <Separator />

            <div className="flex flex-col gap-4">
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
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
