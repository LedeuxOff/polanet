import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Order } from "@/lib/types";
import { incomeTypeLabels, paymentMethodLabels } from "../../consts";
import { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOrderPayments } from "./hooks";
import { OrderPaymentsIncomeList } from "./order-payments-income-list";

interface Props {
  orderId: string;
  order: Order | null;
  setOrder: Dispatch<SetStateAction<Order | null>>;
}

export const OrderPayments = ({ orderId, order, setOrder }: Props) => {
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

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-md p-4">
            <p className="text-sm text-muted-foreground">Получено средств</p>
            <p className="text-2xl font-bold text-green-600">{receivedAmount} ₽</p>
          </div>
          <div className="border rounded-md p-4">
            <p className="text-sm text-muted-foreground">Ожидает подтверждения</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingAmount} ₽</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        {incomes.length > 0 && <OrderPaymentsIncomeList incomes={incomes} />}

        <div className="w-full flex justify-end">
          <Button
            type="button"
            onClick={openIncomeDialog}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Добавить доход
          </Button>
        </div>
      </div>

      {/* Модальное окно добавления дохода */}
      <Dialog open={showIncomeDialog} onOpenChange={setShowIncomeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить доход</DialogTitle>
            <DialogDescription>Заполните данные о доходе</DialogDescription>
          </DialogHeader>
          <form onSubmit={incomeForm.handleSubmit(handleAddIncome)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="incomeType">Тип дохода</Label>
              <Select disabled defaultValue="prepayment">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prepayment">Предоплата</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incomeAmount">Сумма дохода *</Label>
              <Input id="incomeAmount" type="number" {...incomeForm.register("amount")} />
              {incomeForm.formState.errors.amount && (
                <p className="text-sm text-destructive">
                  {incomeForm.formState.errors.amount.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancelIncome}>
                Отмена
              </Button>
              <Button
                type="button"
                disabled={isAddingIncome}
                onClick={incomeForm.handleSubmit(handleAddIncome)}
              >
                {isAddingIncome ? "Добавление..." : "Добавить"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
