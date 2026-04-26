import { transportCardsApi } from "@/lib/api";
import { TransportCard } from "@/lib/types";
import { useEffect, useState } from "react";

export const useTransportCardsListPage = () => {
  const [cards, setCards] = useState<
    (TransportCard & { expenses: any[]; totalExpenses: number })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCards = async () => {
    try {
      const data = await transportCardsApi.list();
      setCards(data);
    } catch (error) {
      console.error("Ошибка загрузки транспортных карт:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту транспортную карту?")) {
      return;
    }

    try {
      await transportCardsApi.delete(id);
      setCards(cards.filter((c) => c.id !== id));
    } catch (error) {
      alert("Ошибка при удалении: " + (error as Error).message);
    }
  };

  return {
    cards,
    isLoading,
    handleDelete,
  };
};
