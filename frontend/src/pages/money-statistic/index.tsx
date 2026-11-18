import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  BanknoteIcon,
  ClockIcon,
  LandmarkIcon,
  PieChartIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import { BottomBar } from "@/components/bottom-bar";
import { SectionCard, Shimmer } from "@/components/data-list";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import {
  axisProps,
  ChartLegend,
  ChartTooltip,
  DonutBreakdown,
  formatRub,
  formatRubCompact,
  gridProps,
  KpiTile,
  MONTH_SHORT,
  SERIES,
  StatsHead,
  useYearStats,
} from "@/components/stats";
import { statisticsApi } from "@/lib/api/statistics-api";
import { usePermissions } from "@/lib/contexts/permission-context";

const INCOME = SERIES.blue;
const EXPENSE = SERIES.orange;

export const MoneyStatisticPage = () => {
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { year, setYear, data, isLoading, error } = useYearStats(statisticsApi.finances);

  const view = useMemo(() => {
    if (!data) return null;
    const base = data.months.map((m) => {
      const income = m.prepayment + m.deliveryPayment;
      const expense = m.fuel + m.salary;
      return { ...m, label: MONTH_SHORT[m.month - 1], income, expense, profit: income - expense };
    });
    const months = base.map((m, i) => ({
      ...m,
      cumulative: base.slice(0, i + 1).reduce((sum, x) => sum + x.profit, 0),
    }));
    const income = months.reduce((s, m) => s + m.income, 0);
    const expense = months.reduce((s, m) => s + m.expense, 0);
    const best = months.reduce((b, m) => (m.profit > b.profit ? m : b), months[0]);
    return {
      months,
      income,
      expense,
      profit: income - expense,
      margin: income ? Math.round(((income - expense) / income) * 100) : 0,
      best,
      prepayment: months.reduce((s, m) => s + m.prepayment, 0),
      deliveryPayment: months.reduce((s, m) => s + m.deliveryPayment, 0),
      fuel: months.reduce((s, m) => s + m.fuel, 0),
      salary: months.reduce((s, m) => s + m.salary, 0),
    };
  }, [data]);

  if (isPermissionsLoading) return <PermissionsLoader />;
  if (!hasPermission("finances:view")) return <NoAccessScreen />;

  const loading = isLoading && !view;

  return (
    <div className="flex flex-col gap-4">
      <StatsHead
        icon={<WalletIcon />}
        iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300"
        title="Статистика по финансам"
        description="Доходы, расходы и прибыль за год"
        years={data?.years ?? []}
        year={year}
        onYearChange={setYear}
      />

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading || !view ? (
          Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} className="h-32 rounded-3xl" />)
        ) : (
          <>
            <KpiTile
              label="Доходы"
              value={formatRubCompact(view.income)}
              hint={formatRub(view.income)}
              icon={<ArrowUpRightIcon />}
              iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300"
            />
            <KpiTile
              label="Расходы"
              value={formatRubCompact(view.expense)}
              hint={formatRub(view.expense)}
              icon={<ArrowDownRightIcon />}
              iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300"
            />
            <KpiTile
              label="Прибыль"
              value={formatRubCompact(view.profit)}
              hint={view.income ? `Рентабельность ${view.margin}%` : "Нет доходов"}
              icon={<TrendingUpIcon />}
              iconClassName={
                view.profit >= 0
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300"
                  : "bg-red-100 text-red-600 dark:bg-red-400/15 dark:text-red-300"
              }
            />
            <KpiTile
              label="Ожидают оплаты"
              value={formatRubCompact(data?.unpaidIncome ?? 0)}
              hint="Неоплаченные доходы"
              icon={<ClockIcon />}
              iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300"
            />
          </>
        )}
      </div>

      {/* Доходы и расходы */}
      <SectionCard
        icon={<BanknoteIcon />}
        title="Доходы и расходы по месяцам"
        description={
          view?.best && view.best.profit > 0 ? `Лучший месяц — ${view.best.label}` : undefined
        }
        action={
          <div className="hidden sm:block">
            <ChartLegend
              items={[
                { label: "Доходы", color: INCOME },
                { label: "Расходы", color: EXPENSE },
              ]}
            />
          </div>
        }
      >
        <div className="sm:hidden">
          <ChartLegend
            items={[
              { label: "Доходы", color: INCOME },
              { label: "Расходы", color: EXPENSE },
            ]}
          />
        </div>
        {loading || !view ? (
          <Shimmer className="h-72 w-full rounded-2xl" />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={view.months} barGap={2} barCategoryGap="22%">
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} width={56} tickFormatter={formatRubCompact} />
                <Tooltip
                  cursor={{ fill: "var(--chart-grid)", opacity: 0.5 }}
                  content={
                    <ChartTooltip
                      formatValue={formatRub}
                      footer={(p) => {
                        const inc = Number(p.find((x) => x.dataKey === "income")?.value ?? 0);
                        const exp = Number(p.find((x) => x.dataKey === "expense")?.value ?? 0);
                        return (
                          <div className="flex justify-between gap-4 text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Прибыль</span>
                            <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                              {formatRub(inc - exp)}
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="income"
                  name="Доходы"
                  fill={INCOME}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="expense"
                  name="Расходы"
                  fill={EXPENSE}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Прибыль по месяцам */}
        <SectionCard
          icon={<TrendingUpIcon />}
          title="Прибыль по месяцам"
          description="Доходы минус расходы"
          action={
            <ChartLegend
              items={[
                { label: "Плюс", color: SERIES.aqua },
                { label: "Минус", color: SERIES.red },
              ]}
            />
          }
        >
          {loading || !view ? (
            <Shimmer className="h-60 w-full rounded-2xl" />
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={view.months}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis {...axisProps} width={56} tickFormatter={formatRubCompact} />
                  <ReferenceLine y={0} stroke="var(--chart-axis)" />
                  <Tooltip
                    cursor={{ fill: "var(--chart-grid)", opacity: 0.5 }}
                    content={<ChartTooltip formatValue={formatRub} />}
                  />
                  <Bar dataKey="profit" name="Прибыль" radius={4} maxBarSize={24}>
                    {view.months.map((m) => (
                      <Cell key={m.month} fill={m.profit >= 0 ? SERIES.aqua : SERIES.red} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        {/* Накопительный итог */}
        <SectionCard
          icon={<LandmarkIcon />}
          title="Накопленная прибыль"
          description="Итог с начала года"
        >
          {loading || !view ? (
            <Shimmer className="h-60 w-full rounded-2xl" />
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={view.months}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis {...axisProps} width={56} tickFormatter={formatRubCompact} />
                  <ReferenceLine y={0} stroke="var(--chart-axis)" strokeDasharray="4 4" />
                  <Tooltip content={<ChartTooltip formatValue={formatRub} />} />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    name="Накоплено"
                    stroke={SERIES.blue}
                    strokeWidth={2}
                    fill={SERIES.blue}
                    fillOpacity={0.12}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--chart-surface)" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Структура */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          icon={<PieChartIcon />}
          title="Структура доходов"
          description="По виду платежа"
        >
          {loading || !view ? (
            <Shimmer className="h-44 w-full rounded-2xl" />
          ) : (
            <div className="flex flex-col gap-5">
              <DonutBreakdown
                centerLabel="Доходы"
                items={[
                  { label: "Оплата доставки", value: view.deliveryPayment, color: SERIES.blue },
                  { label: "Предоплата", value: view.prepayment, color: SERIES.violet },
                ]}
              />
              {data && data.incomeByMethod.length > 0 && (
                <PaymentMethodSplit methods={data.incomeByMethod} />
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={<PieChartIcon />}
          title="Структура расходов"
          description="По статье расхода"
        >
          {loading || !view ? (
            <Shimmer className="h-44 w-full rounded-2xl" />
          ) : (
            <DonutBreakdown
              centerLabel="Расходы"
              items={[
                { label: "Топливо", value: view.fuel, color: SERIES.orange },
                { label: "Зарплата", value: view.salary, color: SERIES.yellow },
              ]}
            />
          )}
        </SectionCard>
      </div>

      <BottomBar hideSaveButton />
    </div>
  );
};

/** Наличные / безналичные — одна полоса с долями */
const PaymentMethodSplit = ({
  methods,
}: {
  methods: { key: "cash" | "bank_transfer"; total: number }[];
}) => {
  const cash = methods.find((m) => m.key === "cash")?.total ?? 0;
  const bank = methods.find((m) => m.key === "bank_transfer")?.total ?? 0;
  const total = cash + bank;
  if (!total) return null;
  const cashPct = Math.round((cash / total) * 100);
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Наличные · {cashPct}%</span>
        <span>Безналичные · {100 - cashPct}%</span>
      </div>
      <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full">
        <div style={{ width: `${cashPct}%`, background: SERIES.aqua }} className="rounded-l-full" />
        <div
          style={{ width: `${100 - cashPct}%`, background: SERIES.magenta }}
          className="rounded-r-full"
        />
      </div>
      <div className="flex justify-between text-xs font-medium tabular-nums text-slate-700 dark:text-slate-200">
        <span>{formatRub(cash)}</span>
        <span>{formatRub(bank)}</span>
      </div>
    </div>
  );
};
