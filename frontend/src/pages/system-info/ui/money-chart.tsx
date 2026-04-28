import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CandleData } from "../../money-statistic/hooks";

interface MoneyChartProps {
  data: CandleData[];
  isLoading: boolean;
}

interface TooltipPayload {
  dataKey: string;
  value: number;
  name: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const expenses = payload.find((p) => p.dataKey === "expenses");
    const incomes = payload.find((p) => p.dataKey === "incomes");

    return (
      <div className="bg-white p-4 border border-gray-200 shadow rounded">
        <p className="font-bold mb-2">{label}</p>
        {expenses && (
          <p className="text-red-500">
            Расход: {Number(expenses.value).toLocaleString("ru-RU")} руб.
          </p>
        )}
        {incomes && (
          <p className="text-green-500">
            Доход: {Number(incomes.value).toLocaleString("ru-RU")} руб.
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const MoneyChart = ({ data, isLoading }: MoneyChartProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">Загрузка...</div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          label={{ value: "Месяц", position: "insideBottom", offset: -5 }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          label={{ value: "Сумма (руб)", angle: -90, position: "insideLeft" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="expenses" fill="#ef4444" barSize={30} />
        <Bar dataKey="incomes" name="Доходы (оплата доставки)" fill="#22c55e" barSize={30} />
      </BarChart>
    </ResponsiveContainer>
  );
};
