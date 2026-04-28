import { expensesApi } from "@/lib/api/expenses-api";
import { incomesApi } from "@/lib/api/incomes-api";
import { Expense, ExpenseType } from "@/lib/types/expense-types";
import { Income } from "@/lib/types/delivery-types";
import { useEffect, useState, useMemo } from "react";

export interface CandleData {
  month: string;
  monthIndex: number;
  expenses: number;
  incomes: number;
}

const MONTHS = [
  { index: 0, name: "Янв" },
  { index: 1, name: "Фев" },
  { index: 2, name: "Мар" },
  { index: 3, name: "Апр" },
  { index: 4, name: "Май" },
  { index: 5, name: "Июн" },
  { index: 6, name: "Июл" },
  { index: 7, name: "Авг" },
  { index: 8, name: "Сен" },
  { index: 9, name: "Окт" },
  { index: 10, name: "Ноя" },
  { index: 11, name: "Дек" },
];

export const useMoneyStatistic = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [expensesData, incomesData] = await Promise.all([
          expensesApi.list(),
          incomesApi.list(),
        ]);

        setExpenses(expensesData);
        setIncomes(incomesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка при загрузке данных");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const candleData = useMemo((): CandleData[] => {
    // Инициализируем данные для всех 12 месяцев
    const data: CandleData[] = MONTHS.map((m) => ({
      month: m.name,
      monthIndex: m.index,
      expenses: 0,
      incomes: 0,
    }));

    // Суммируем расходы по месяцам
    expenses.forEach((expense) => {
      try {
        const date = new Date(expense.dateTime);
        const monthIndex = date.getMonth();
        const candle = data.find((d) => d.monthIndex === monthIndex);
        if (candle) {
          candle.expenses += expense.amount || 0;
        }
      } catch {
        // Игнорируем ошибки парсинга даты
      }
    });

    // Суммируем доходы (только "delivery_payment") по месяцам
    incomes.forEach((income) => {
      if (income.incomeType === "delivery_payment") {
        try {
          const date = new Date(income.paymentDate);
          const monthIndex = date.getMonth();
          const candle = data.find((d) => d.monthIndex === monthIndex);
          if (candle) {
            candle.incomes += income.amount || 0;
          }
        } catch {
          // Игнорируем ошибки парсинга даты
        }
      }
    });

    return data;
  }, [expenses, incomes]);

  return {
    isLoading,
    error,
    candleData,
  };
};
