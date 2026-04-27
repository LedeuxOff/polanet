import { driversApi, transportCardsApi, expensesApi } from "@/lib/api";
import {
  Driver,
  TransportCard,
  TransportCardForm,
  transportCardSchema,
  ExpensePaymentType,
} from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";

export const useTransportCardDetailPage = () => {
  const { cardId } = useParams({ from: "/transport-cards/$cardId" });
  const navigate = useNavigate();

  const [card, setCard] = useState<TransportCard | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Расходы - новая сущность Expense
  // Для транспортных карт тип расхода всегда "fuel" (топливо)
  const EXPENSE_TYPE = "fuel" as const;
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDateTime, setExpenseDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [expensePaymentType, setExpensePaymentType] = useState<ExpensePaymentType>("cash");
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);

  const form = useForm<TransportCardForm>({
    resolver: zodResolver(transportCardSchema),
  });

  const loadCard = useCallback(() => {
    driversApi.list().then(setDrivers).catch(console.error);

    transportCardsApi
      .get(Number(cardId))
      .then((data) => {
        setCard(data);
        form.setValue("cardNumber", data.cardNumber);
        form.setValue("status", data.status);
        form.setValue("driverId", data.driverId);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [cardId, form]);

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  const onSubmit = async (data: TransportCardForm) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await transportCardsApi.update(Number(cardId), data);
      if (cardId === "new") {
        navigate({ to: "/transport-cards" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при сохранении");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить эту транспортную карту?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await transportCardsApi.delete(Number(cardId));
      navigate({ to: "/transport-cards" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при удалении");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddExpense = async () => {
    if (!expenseAmount || !expenseDateTime) {
      setError("Укажите сумму и дату/время расхода");
      return;
    }

    setIsAddingExpense(true);
    setError(null);
    try {
      // Создаем расход через новую сущность Expense
      // Для транспортных карт тип расхода всегда "fuel" (топливо)
      await expensesApi.create({
        expenseType: EXPENSE_TYPE,
        paymentType: expensePaymentType,
        transportCardId: Number(cardId),
        dateTime: expenseDateTime,
        amount: Number(expenseAmount),
        comment: null,
      });

      // Обновляем данные карты
      const updated = await transportCardsApi.get(Number(cardId));
      setCard(updated);

      // Сбрасываем форму и закрываем диалог
      setExpenseAmount("");
      setExpenseDateTime(new Date().toISOString().slice(0, 16));
      setShowExpenseDialog(false);

      // Перезагружаем данные
      setCard(await transportCardsApi.get(Number(cardId)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при добавлении расхода");
    } finally {
      setIsAddingExpense(false);
    }
  };

  const handleRemoveExpense = async (expenseId: number) => {
    if (!confirm("Удалить этот расход?")) {
      return;
    }

    try {
      await expensesApi.delete(expenseId);
      const updated = await transportCardsApi.get(Number(cardId));
      setCard(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при удалении расхода");
    }
  };

  const openExpenseDialog = () => {
    setShowExpenseDialog(true);
    setError(null);
  };

  return {
    isLoading,
    card,
    cardId,
    handleDelete,
    isDeleting,
    form,
    onSubmit,
    error,
    isSubmitting,
    drivers,
    expenseAmount,
    setExpenseAmount,
    expenseDateTime,
    setExpenseDateTime,
    expensePaymentType,
    setExpensePaymentType,
    handleAddExpense,
    isAddingExpense,
    handleRemoveExpense,
    showExpenseDialog,
    setShowExpenseDialog,
    openExpenseDialog,
  };
};
