import { incomesApi, ordersApi } from "@/lib/api";
import { Income, IncomeForm, incomeSchema, Order } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface Props {
  orderId: string;
  order: Order | null;
  setOrder: Dispatch<SetStateAction<Order | null>>;
}

export const useOrderPayments = ({ orderId, order, setOrder }: Props) => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);

  const incomeForm = useForm<IncomeForm>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      amount: 0,
    },
  });

  useEffect(() => {
    incomesApi.list(Number(orderId)).then(setIncomes).catch(console.error);
  }, []);

  const handleAddIncome = async (data: IncomeForm) => {
    setError(null);
    setIsAddingIncome(true);
    try {
      const incomeData = {
        orderId: Number(orderId),
        amount: data.amount,
        incomeType: "prepayment" as const,
        paymentMethod: "cash" as const,
        isPaid: true,
        deliveryId: null,
        paymentDate: new Date().toISOString().split("T")[0],
      };
      await incomesApi.create(incomeData);
      setShowIncomeDialog(false);
      incomeForm.reset();
      // Обновляем список доходов
      const updatedIncomes = await incomesApi.list(Number(orderId));
      setIncomes(updatedIncomes);
      // Обновляем данные заявки (с пересчитанными значениями с сервера)
      const updated = await ordersApi.get(Number(orderId));
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при добавлении дохода");
    } finally {
      setIsAddingIncome(false);
    }
  };

  const openIncomeDialog = () => {
    setShowIncomeDialog(true);
    incomeForm.reset();
  };

  const handleCancelIncome = () => {
    setShowIncomeDialog(false);
    incomeForm.reset();
  };

  // Получаем значения с сервера
  const receivedAmount = order?.receivedAmount ?? 0;
  const pendingAmount = order?.pendingAmount ?? 0;
  const customerDebt = order?.customerDebt ?? 0;
  const companyDebt = order?.companyDebt ?? 0;

  return {
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
  };
};
