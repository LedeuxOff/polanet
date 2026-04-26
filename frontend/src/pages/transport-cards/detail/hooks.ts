import { driversApi, transportCardsApi } from "@/lib/api";
import { Driver, TransportCard, TransportCardForm, transportCardSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

  // Расходы
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  const form = useForm<TransportCardForm>({
    resolver: zodResolver(transportCardSchema),
  });

  useEffect(() => {
    driversApi.list().then(setDrivers).catch(console.error);

    transportCardsApi
      .get(Number(cardId))
      .then((data) => {
        setCard(data);
        form.setValue("cardNumber", data.cardNumber);
        form.setValue("driverId", data.driverId);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [cardId, form.setValue]);

  const onSubmit = async (data: TransportCardForm) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await transportCardsApi.update(Number(cardId), data);
      navigate({ to: "/transport-cards" });
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
    if (!expenseAmount || !expenseDate) {
      setError("Укажите сумму и дату расхода");
      return;
    }

    setIsAddingExpense(true);
    try {
      await transportCardsApi.addExpense(Number(cardId), {
        cardId: Number(cardId),
        amount: Number(expenseAmount),
        paymentDate: expenseDate,
      });
      setExpenseAmount("");
      const updated = await transportCardsApi.get(Number(cardId));
      setCard(updated);
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
      await transportCardsApi.removeExpense(Number(cardId), expenseId);
      const updated = await transportCardsApi.get(Number(cardId));
      setCard(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при удалении расхода");
    }
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
    expenseDate,
    setExpenseDate,
    handleAddExpense,
    isAddingExpense,
    handleRemoveExpense,
  };
};
