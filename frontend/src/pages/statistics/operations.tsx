import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BoxIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  ContainerIcon,
  HeartHandshakeIcon,
  ListChecksIcon,
  TruckIcon,
  UserRoundIcon,
} from "lucide-react";
import { BottomBar } from "@/components/bottom-bar";
import { SectionCard, Shimmer } from "@/components/data-list";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import {
  axisProps,
  ChartLegend,
  ChartTooltip,
  formatNumber,
  gridProps,
  KpiTile,
  MONTH_SHORT,
  RankList,
  SERIES,
  StatsHead,
  useYearStats,
} from "@/components/stats";
import { statisticsApi } from "@/lib/api/statistics-api";
import { usePermissions } from "@/lib/contexts/permission-context";
import { statusLabels } from "@/pages/orders/list/consts";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const STATUS_ORDER = ["new", "in_progress", "completed", "cancelled", "archived", "draft"];

export const OperationsStatisticPage = () => {
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { year, setYear, data, isLoading, error } = useYearStats(statisticsApi.operations);

  const view = useMemo(() => {
    if (!data) return null;
    const months = data.months.map((m) => ({ ...m, label: MONTH_SHORT[m.month - 1] }));
    const orders = months.reduce((s, m) => s + m.orders, 0);
    const deliveries = months.reduce((s, m) => s + m.deliveries, 0);
    const volume = months.reduce((s, m) => s + m.volume, 0);
    // SQLite: 0 = вс → переводим в Пн..Вс
    const weekday = WEEKDAYS.map((label, i) => ({
      label,
      total: data.deliveriesByWeekday.find((d) => d.day === (i + 1) % 7)?.total ?? 0,
    }));
    const busiest = weekday.reduce((b, d) => (d.total > b.total ? d : b), weekday[0]);
    const statuses = [...data.ordersByStatus].sort(
      (a, b) => STATUS_ORDER.indexOf(a.key) - STATUS_ORDER.indexOf(b.key),
    );
    return { months, orders, deliveries, volume, weekday, busiest, statuses };
  }, [data]);

  if (isPermissionsLoading) return <PermissionsLoader />;
  if (!hasPermission("statistics:operations")) return <NoAccessScreen />;

  const loading = isLoading && !view;
  const legend = [
    { label: "Заявки", color: SERIES.blue },
    { label: "Доставки", color: SERIES.orange },
  ];

  return (
    <div className="flex flex-col gap-4">
      <StatsHead
        icon={<ClipboardListIcon />}
        iconClassName="bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300"
        title="Заявки и доставки"
        description="Объём работы, загрузка водителей и клиенты"
        years={data?.years ?? []}
        year={year}
        onYearChange={setYear}
      />

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading || !view ? (
          Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} className="h-32 rounded-3xl" />)
        ) : (
          <>
            <KpiTile
              label="Заявок"
              value={formatNumber(view.orders)}
              hint="Без черновиков"
              icon={<ClipboardListIcon />}
              iconClassName="bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300"
            />
            <KpiTile
              label="Доставок"
              value={formatNumber(view.deliveries)}
              hint={
                view.orders
                  ? `≈ ${formatNumber(view.deliveries / view.orders, 1)} на заявку`
                  : undefined
              }
              icon={<TruckIcon />}
              iconClassName="bg-cyan-100 text-cyan-600 dark:bg-cyan-400/15 dark:text-cyan-300"
            />
            <KpiTile
              label="Перевезено"
              value={`${formatNumber(view.volume)} м³`}
              hint="Суммарный объём доставок"
              icon={<ContainerIcon />}
              iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300"
            />
            <KpiTile
              label="Средний рейс"
              value={`${view.deliveries ? formatNumber(view.volume / view.deliveries, 1) : 0} м³`}
              hint="Объём одной доставки"
              icon={<BoxIcon />}
            />
          </>
        )}
      </div>

      <SectionCard
        icon={<CalendarDaysIcon />}
        title="Заявки и доставки по месяцам"
        description="Заявки — по дате создания, доставки — по дате рейса"
        action={
          <div className="hidden sm:block">
            <ChartLegend items={legend} />
          </div>
        }
      >
        <div className="sm:hidden">
          <ChartLegend items={legend} />
        </div>
        {loading || !view ? (
          <Shimmer className="h-72 w-full rounded-2xl" />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={view.months} barGap={2} barCategoryGap="22%">
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} width={36} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "var(--chart-grid)", opacity: 0.5 }}
                  content={<ChartTooltip />}
                />
                <Bar
                  dataKey="orders"
                  name="Заявки"
                  fill={SERIES.blue}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="deliveries"
                  name="Доставки"
                  fill={SERIES.orange}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          icon={<ContainerIcon />}
          title="Объём перевозок"
          description="Кубометры по месяцам"
        >
          {loading || !view ? (
            <Shimmer className="h-60 w-full rounded-2xl" />
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={view.months}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis {...axisProps} width={40} />
                  <Tooltip
                    content={<ChartTooltip formatValue={(v) => `${formatNumber(v)} м³`} />}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    name="Объём"
                    stroke={SERIES.aqua}
                    strokeWidth={2}
                    fill={SERIES.aqua}
                    fillOpacity={0.12}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--chart-surface)" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={<CalendarDaysIcon />}
          title="Доставки по дням недели"
          description={
            view && view.busiest.total > 0
              ? `Самый загруженный день — ${view.busiest.label}`
              : undefined
          }
        >
          {loading || !view ? (
            <Shimmer className="h-60 w-full rounded-2xl" />
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={view.weekday}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis {...axisProps} width={36} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: "var(--chart-grid)", opacity: 0.5 }}
                    content={<ChartTooltip />}
                  />
                  <Bar
                    dataKey="total"
                    name="Доставок"
                    fill={SERIES.violet}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard icon={<ListChecksIcon />} title="Заявки по статусам">
          {loading || !view ? (
            <Shimmer className="h-48 w-full rounded-2xl" />
          ) : (
            <RankList
              color={SERIES.blue}
              items={view.statuses.map((s) => ({
                key: s.key,
                label: statusLabels[s.key] ?? s.key,
                value: s.total,
                display: formatNumber(s.total),
              }))}
            />
          )}
        </SectionCard>

        <SectionCard
          icon={<HeartHandshakeIcon />}
          title="Топ клиентов"
          description="По числу заявок"
        >
          {loading || !data ? (
            <Shimmer className="h-48 w-full rounded-2xl" />
          ) : (
            <RankList
              color={SERIES.yellow}
              items={data.topClients.map((c) => ({
                key: c.id,
                label: c.name || "Без имени",
                value: c.orders,
                display: formatNumber(c.orders),
              }))}
            />
          )}
        </SectionCard>

        <SectionCard icon={<UserRoundIcon />} title="Топ водителей" description="По числу рейсов">
          {loading || !data ? (
            <Shimmer className="h-48 w-full rounded-2xl" />
          ) : (
            <RankList
              color={SERIES.aqua}
              items={data.topDrivers.map((d) => ({
                key: d.id,
                label: d.name,
                value: d.deliveries,
                display: formatNumber(d.deliveries),
                sub: `${formatNumber(d.volume)} м³`,
              }))}
            />
          )}
        </SectionCard>
      </div>

      <BottomBar hideSaveButton />
    </div>
  );
};
