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
  BanknoteIcon,
  CalculatorIcon,
  HardHatIcon,
  LayersIcon,
  ListChecksIcon,
  RulerIcon,
  ShapesIcon,
} from "lucide-react";
import { BottomBar } from "@/components/bottom-bar";
import { SectionCard, Shimmer } from "@/components/data-list";
import { PermissionsLoader } from "@/components/screens/loaders/permissions-loader";
import { NoAccessScreen } from "@/components/screens/no-access";
import {
  axisProps,
  ChartTooltip,
  formatNumber,
  formatRub,
  formatRubCompact,
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

export const WorksStatisticPage = () => {
  const { hasPermission, isLoading: isPermissionsLoading } = usePermissions();
  const { year, setYear, data, isLoading, error } = useYearStats(statisticsApi.works);

  const view = useMemo(() => {
    if (!data) return null;
    const months = data.months.map((m) => ({ ...m, label: MONTH_SHORT[m.month - 1] }));
    const works = months.reduce((s, m) => s + m.works, 0);
    const area = months.reduce((s, m) => s + m.area, 0);
    const revenue = months.reduce((s, m) => s + m.revenue, 0);
    const peak = months.reduce((b, m) => (m.area > b.area ? m : b), months[0]);
    return { months, works, area, revenue, peak };
  }, [data]);

  if (isPermissionsLoading) return <PermissionsLoader />;
  if (!hasPermission("statistics:works")) return <NoAccessScreen />;

  const loading = isLoading && !view;

  return (
    <div className="flex flex-col gap-4">
      <StatsHead
        icon={<LayersIcon />}
        iconClassName="bg-teal-100 text-teal-600 dark:bg-teal-400/15 dark:text-teal-300"
        title="Стяжка"
        description="Объёмы работ, выручка и загрузка бригад"
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
              label="Работ"
              value={formatNumber(view.works)}
              hint="Кроме скрытых из календаря"
              icon={<ListChecksIcon />}
              iconClassName="bg-teal-100 text-teal-600 dark:bg-teal-400/15 dark:text-teal-300"
            />
            <KpiTile
              label="Площадь"
              value={`${formatNumber(view.area)} м²`}
              hint={
                view.works ? `≈ ${formatNumber(view.area / view.works)} м² на объект` : undefined
              }
              icon={<RulerIcon />}
              iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300"
            />
            <KpiTile
              label="Сумма работ"
              value={formatRubCompact(view.revenue)}
              hint={formatRub(view.revenue)}
              icon={<BanknoteIcon />}
              iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300"
            />
            <KpiTile
              label="Цена за м²"
              value={view.area ? formatRub(view.revenue / view.area) : "—"}
              hint="Средняя по году"
              icon={<CalculatorIcon />}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          icon={<RulerIcon />}
          title="Площадь по месяцам"
          description={
            view && view.peak.area > 0
              ? `Пик — ${view.peak.label}, ${formatNumber(view.peak.area)} м²`
              : "Квадратные метры"
          }
        >
          {loading || !view ? (
            <Shimmer className="h-64 w-full rounded-2xl" />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={view.months}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis {...axisProps} width={48} tickFormatter={(v) => formatNumber(v)} />
                  <Tooltip
                    cursor={{ fill: "var(--chart-grid)", opacity: 0.5 }}
                    content={<ChartTooltip formatValue={(v) => `${formatNumber(v)} м²`} />}
                  />
                  <Bar
                    dataKey="area"
                    name="Площадь"
                    fill={SERIES.blue}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={<BanknoteIcon />}
          title="Сумма работ по месяцам"
          description="По цене в карточке работы"
        >
          {loading || !view ? (
            <Shimmer className="h-64 w-full rounded-2xl" />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={view.months}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis {...axisProps} width={56} tickFormatter={formatRubCompact} />
                  <Tooltip content={<ChartTooltip formatValue={formatRub} />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Сумма"
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
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard icon={<ListChecksIcon />} title="Работы по статусам">
          {loading || !data ? (
            <Shimmer className="h-48 w-full rounded-2xl" />
          ) : (
            <RankList
              color={SERIES.violet}
              items={data.byStatus.map((s) => ({
                key: s.key,
                label: s.name,
                value: s.total,
                display: formatNumber(s.total),
              }))}
            />
          )}
        </SectionCard>

        <SectionCard icon={<ShapesIcon />} title="Типы работ" description="По количеству">
          {loading || !data ? (
            <Shimmer className="h-48 w-full rounded-2xl" />
          ) : (
            <RankList
              color={SERIES.orange}
              items={data.byType.map((t) => ({
                key: t.key,
                label: t.name,
                value: t.total,
                display: formatNumber(t.total),
                sub: `${formatNumber(t.area)} м²`,
              }))}
            />
          )}
        </SectionCard>

        <SectionCard icon={<HardHatIcon />} title="Бригады" description="По залитой площади">
          {loading || !data ? (
            <Shimmer className="h-48 w-full rounded-2xl" />
          ) : (
            <RankList
              color={SERIES.aqua}
              empty="Работы за этот год не распределены по бригадам"
              items={data.byTeam.map((t) => ({
                key: t.id,
                label: t.name,
                value: t.area,
                display: `${formatNumber(t.area)} м²`,
                sub: `${formatNumber(t.works)} работ`,
              }))}
            />
          )}
        </SectionCard>
      </div>

      <BottomBar hideSaveButton />
    </div>
  );
};
