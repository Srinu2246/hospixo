'use client';

/**
 * Reports overview — KPIs, trends, order types, sessions, finance, and operations from
 * GET /v1/branches/{branch_id}/reports/overview.
 */

import { useMemo, useState, type ReactNode } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  Banknote,
  CalendarCheck,
  ClipboardList,
  Clock,
  CreditCard,
  Download,
  ShoppingBag,
  Smartphone,
  Timer,
  Truck,
  UserRound,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';
import { TrendChart } from '@/components/shared/ui/TrendChart';
import { MetricCard, type MetricCardAccent } from '@/components/shared/ui/MetricCard';
import { KpiCard, type KpiCardAccent } from '@/components/shared/ui/KpiCard';
import { OrdersTable } from '@/components/shared/ui/OrdersTable';
import { SectionHeader } from '@/components/shared/ui/SectionHeader';
import { SessionsTable } from '@/components/shared/ui/SessionsTable';
import { ReportsOverviewDateRange } from '@/features/reports/reports/ReportsOverviewDateRange';
import {
  createDefaultReportsDateRange,
  deriveComparisonRange,
  formatInrAmount,
  formatIsoDate,
} from '@/lib/helpers/reportsOverview';
import { toReportsOverviewViewModel } from '@/lib/schemas/reports/reports/branchReports';
import { useReportsOverview } from '@/lib/hooks/reports/reports/useBranchReports';
import { reportsPageCopy } from '@/lib/mocks/reports/reports.mocks';

const KPI_ICONS = {
  'completed-orders': ShoppingBag,
  'amount-collected': Banknote,
  'staff-on-shift': Users,
} as const;

const CHANNEL_ICON = {
  'dine-in': UtensilsCrossed,
  takeaway: ShoppingBag,
  delivery: Truck,
} as const;

const CHANNEL_STAT_ACCENT: Record<string, KpiCardAccent & MetricCardAccent> = {
  'dine-in': 'info',
  takeaway: 'warning',
  delivery: 'success',
};

const FINANCE_ICONS: Record<string, LucideIcon> = {
  'net-collections': Banknote,
  cash: Banknote,
  upi: Smartphone,
  card: CreditCard,
};

const OPERATIONS_ICONS: Record<string, LucideIcon> = {
  'staff-worked': Users,
  'completed-shifts': CalendarCheck,
  'active-staff': UserRound,
  'completed-orders': ClipboardList,
  'late-kitchen': Clock,
  'avg-prep': Timer,
};

type TrendMetric = 'sales' | 'orders';

function OverviewSectionCard({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '0.75rem',
        bgcolor: 'background.paper',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        p: { xs: 2, sm: 2.5 },
      }}
    >
      {children}
    </Card>
  );
}

function StatGrid({ children, columns = 4 }: Readonly<{ children: ReactNode; columns?: 3 | 4 }>) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: `repeat(${columns}, 1fr)`,
        },
        gap: 2,
      }}
    >
      {children}
    </Box>
  );
}

export function ReportsOverviewPage() {
  const defaultRange = useMemo(() => createDefaultReportsDateRange(), []);
  const [dateFrom, setDateFrom] = useState(defaultRange.dateFrom);
  const [dateTo, setDateTo] = useState(defaultRange.dateTo);
  const [trendMetric, setTrendMetric] = useState<TrendMetric>('sales');

  const comparisonRange = useMemo(
    () => deriveComparisonRange(dateFrom, dateTo),
    [dateFrom, dateTo],
  );

  const { data, isLoading, isError, error } = useReportsOverview({
    dateFrom,
    dateTo,
    compareFrom: formatIsoDate(comparisonRange.compareFrom),
    compareTo: formatIsoDate(comparisonRange.compareTo),
  });

  const viewModel = useMemo(() => (data ? toReportsOverviewViewModel(data) : undefined), [data]);

  const trendChart = useMemo(
    () => (trendMetric === 'sales' ? viewModel?.salesTrend : viewModel?.ordersTrend),
    [trendMetric, viewModel],
  );

  const formatTrendYAxis = useMemo(
    () =>
      trendMetric === 'sales'
        ? (value: number) => formatInrAmount(value)
        : (value: number) => value.toLocaleString('en-IN'),
    [trendMetric],
  );

  let overviewBody: ReactNode;
  if (isLoading) {
    overviewBody = <Loading message="Loading business overview…" />;
  } else if (isError || !viewModel) {
    overviewBody = (
      <AlertMessage
        variant="error"
        title="Unable to load business overview"
        message={
          error instanceof Error ? error.message : 'Try adjusting the date range and refresh.'
        }
      />
    );
  } else {
    overviewBody = (
      <>
        <OverviewSectionCard>
          <StatGrid columns={3}>
            {viewModel.kpis.map((kpi, index) => {
              const Icon = KPI_ICONS[kpi.id as keyof typeof KPI_ICONS] ?? ShoppingBag;
              return (
                <KpiCard
                  key={kpi.id}
                  label={kpi.label}
                  value={kpi.value}
                  icon={Icon}
                  accent="info"
                  selected={index === 0}
                  changePercent={kpi.id === 'completed-orders' ? kpi.changePercent : undefined}
                  changeLabel={kpi.id === 'completed-orders' ? kpi.changeLabel : undefined}
                  footerText={kpi.id === 'amount-collected' ? kpi.footer : undefined}
                  footerContent={
                    kpi.id === 'staff-on-shift' ? (
                      <Typography
                        component="div"
                        sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}
                      >
                        {viewModel.staffShiftFooter}
                      </Typography>
                    ) : undefined
                  }
                />
              );
            })}
          </StatGrid>

          <Box sx={{ mt: 2 }}>
            <StatGrid columns={3}>
              {viewModel.orderChannels.map((channel) => {
                const Icon = CHANNEL_ICON[channel.id];
                const accent = CHANNEL_STAT_ACCENT[channel.id] ?? 'info';
                return (
                  <KpiCard
                    key={channel.id}
                    label={channel.label}
                    value={channel.count}
                    icon={Icon}
                    accent={accent}
                    footerText={channel.shareLabel}
                  />
                );
              })}
            </StatGrid>
          </Box>
        </OverviewSectionCard>

        <OverviewSectionCard>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 2,
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25 }}>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
                {reportsPageCopy.salesOrderTrendTitle}
              </Typography>
              <Chip
                label="Complete"
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={trendMetric}
              onChange={(_e, value: TrendMetric | null) => {
                if (value) setTrendMetric(value);
              }}
              sx={{
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  px: 2,
                },
              }}
            >
              <ToggleButton value="sales">Sales</ToggleButton>
              <ToggleButton value="orders">Orders</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mb: 2 }}>
            {reportsPageCopy.salesOrderTrendSubtitle}
          </Typography>

          {trendChart ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 280px' },
                gap: 2,
                alignItems: 'stretch',
              }}
            >
              <TrendChart
                title={trendChart.title}
                xLabels={trendChart.xLabels}
                primarySeries={trendChart.primarySeries}
                comparisonSeries={trendChart.comparisonSeries}
                primaryLegendLabel={trendChart.primaryLegendLabel}
                comparisonLegendLabel={trendChart.comparisonLegendLabel}
                highlightedLabel={trendChart.highlightedLabel}
                yAxisStep={trendChart.yAxisStep}
                formatYAxisValue={formatTrendYAxis}
                ariaLabel="Sales and order trend comparison chart"
              />
              <Box
                sx={{
                  borderRadius: '0.75rem',
                  border: '1px solid',
                  borderColor: 'info.main',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(56, 189, 248, 0.08)'
                      : 'rgba(14, 165, 233, 0.06)',
                  p: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    color: 'info.main',
                  }}
                >
                  {viewModel.topSalesSummary.title}
                </Typography>
                <Typography
                  sx={{ mt: 1.25, fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}
                >
                  {viewModel.topSalesSummary.headline}
                </Typography>
                <Typography sx={{ mt: 0.5, fontSize: '0.8125rem', color: 'text.secondary' }}>
                  {viewModel.topSalesSummary.dayLabel}
                </Typography>
                <Typography
                  sx={{ mt: 1.5, fontSize: '1.25rem', fontWeight: 700, color: 'text.primary' }}
                >
                  {viewModel.topSalesSummary.amount}
                </Typography>
              </Box>
            </Box>
          ) : null}
        </OverviewSectionCard>

        <OverviewSectionCard>
          <SectionHeader
            title={reportsPageCopy.orderTypePerformanceTitle}
            subtitle={viewModel.orderTypeSubtitle}
            actionLabel="View All Orders"
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'stretch',
              gap: 2,
            }}
          >
            {viewModel.orderTypeRows.map((row) => {
              const Icon = CHANNEL_ICON[row.id as keyof typeof CHANNEL_ICON] ?? UtensilsCrossed;
              const accent = CHANNEL_STAT_ACCENT[row.id] ?? 'info';
              return (
                <MetricCard
                  key={row.id}
                  label={row.label}
                  icon={Icon}
                  sharePercent={row.sharePercent}
                  shareOf="orders"
                  primaryValue={row.count}
                  secondaryValue={row.amount}
                  accent={accent}
                />
              );
            })}
          </Box>
        </OverviewSectionCard>

        <OverviewSectionCard>
          <SectionHeader
            title={reportsPageCopy.recentOrdersTitle}
            badge="Complete"
            badgeColor="success"
            subtitle={reportsPageCopy.recentOrdersSubtitle}
            actionLabel={reportsPageCopy.recentOrdersAction}
          />
          <OrdersTable rows={viewModel.recentOrders} footerText={viewModel.recentOrdersFooter} />
        </OverviewSectionCard>

        <OverviewSectionCard>
          <SectionHeader
            title={reportsPageCopy.sessionPerformanceTitle}
            subtitle={reportsPageCopy.sessionPerformanceSubtitle}
            actionLabel={reportsPageCopy.sessionPerformanceAction}
          />
          <SessionsTable rows={viewModel.sessionRows} />
        </OverviewSectionCard>

        <OverviewSectionCard>
          <SectionHeader
            title={reportsPageCopy.financeSummaryTitle}
            badge={reportsPageCopy.financeSummaryBadge}
            badgeColor="warning"
            subtitle={reportsPageCopy.financeSummarySubtitle}
            actionLabel={reportsPageCopy.financeSummaryAction}
          />
          <StatGrid columns={4}>
            {viewModel.financeStats.map((stat) => (
              <KpiCard
                key={stat.id}
                label={stat.label}
                value={stat.value}
                icon={FINANCE_ICONS[stat.id] ?? Banknote}
                accent={stat.accent as KpiCardAccent}
                helperText={stat.helperText}
                sx={{ minHeight: 132 }}
              />
            ))}
          </StatGrid>
        </OverviewSectionCard>

        <OverviewSectionCard>
          <SectionHeader
            title={reportsPageCopy.staffOperationsTitle}
            badge={reportsPageCopy.staffOperationsBadge}
            badgeColor="warning"
            subtitle={reportsPageCopy.staffOperationsSubtitle}
            actionLabel={reportsPageCopy.staffOperationsAction}
          />
          <StatGrid columns={3}>
            {viewModel.operationsStats.map((stat) => (
              <KpiCard
                key={stat.id}
                label={stat.label}
                value={stat.value}
                icon={OPERATIONS_ICONS[stat.id] ?? Users}
                accent={stat.accent as KpiCardAccent}
                helperText={stat.helperText}
                sx={{ minHeight: 132 }}
              />
            ))}
          </StatGrid>
        </OverviewSectionCard>
      </>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <OverviewSectionCard>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.01em' }}
            >
              {reportsPageCopy.businessOverviewTitle}
            </Typography>
            <Typography
              sx={{ mt: 0.5, fontSize: '0.8125rem', color: 'text.secondary', maxWidth: 520 }}
            >
              {reportsPageCopy.businessOverviewSubtitle}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
            <ReportsOverviewDateRange
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
            />
            <Button
              type="button"
              variant="outlined"
              size="small"
              startIcon={<Download size={16} />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8125rem',
                borderRadius: '0.5rem',
                color: 'info.main',
                borderColor: 'divider',
              }}
            >
              {reportsPageCopy.exportLabel}
            </Button>
          </Box>
        </Box>
      </OverviewSectionCard>

      {overviewBody}
    </Box>
  );
}
