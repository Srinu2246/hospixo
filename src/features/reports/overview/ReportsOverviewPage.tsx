'use client';

/**
 * Reports overview screen — business KPIs, trend chart, order types, recent orders,
 * session performance, finance, and operations. Data from mocks; UI from shared components.
 */

import { useMemo, useState, type ElementType, type ReactNode } from 'react';
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
} from 'lucide-react';

import { DualSeriesLineChart } from '@/components/shared/ui/DualSeriesLineChart';
import {
  OrderTypeMetricCard,
  type OrderTypeMetricAccent,
} from '@/components/shared/ui/OrderTypeMetricCard';
import { OverviewStatCard, type OverviewStatAccent } from '@/components/shared/ui/OverviewStatCard';
import { RecentOrdersTable } from '@/components/shared/ui/RecentOrdersTable';
import { ReportSectionHeader } from '@/components/shared/ui/ReportSectionHeader';
import { SessionPerformanceTable } from '@/components/shared/ui/SessionPerformanceTable';
import {
  MOCK_REPORTS_FINANCE_STATS,
  MOCK_REPORTS_OPERATIONS_STATS,
  MOCK_REPORTS_ORDER_CHANNELS,
  MOCK_REPORTS_ORDER_TYPE_ROWS,
  MOCK_REPORTS_ORDERS_TREND,
  MOCK_REPORTS_OVERVIEW_KPIS,
  MOCK_REPORTS_RECENT_ORDERS,
  MOCK_REPORTS_SALES_TREND,
  MOCK_REPORTS_SESSION_PERFORMANCE,
  MOCK_REPORTS_TOP_SALES,
  MOCK_REPORTS_WEEK_LABELS,
  reportsPageCopy,
} from '@/lib/mocks/reports/reports.mocks';

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

const CHANNEL_STAT_ACCENT: Record<string, OverviewStatAccent & OrderTypeMetricAccent> = {
  'dine-in': 'info',
  takeaway: 'warning',
  delivery: 'success',
};

const FINANCE_ICONS: Record<string, ElementType> = {
  'net-collections': Banknote,
  cash: Banknote,
  upi: Smartphone,
  card: CreditCard,
};

const OPERATIONS_ICONS: Record<string, ElementType> = {
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
  const [trendMetric, setTrendMetric] = useState<TrendMetric>('sales');

  const trendChart = useMemo(
    () => (trendMetric === 'sales' ? MOCK_REPORTS_SALES_TREND : MOCK_REPORTS_ORDERS_TREND),
    [trendMetric],
  );

  const formatTrendYAxis = useMemo(
    () =>
      trendMetric === 'sales'
        ? (value: number) => `₹${value.toLocaleString('en-IN')}`
        : (value: number) => value.toLocaleString('en-IN'),
    [trendMetric],
  );

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
            mb: 2.5,
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
            <Button
              type="button"
              variant="outlined"
              size="small"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8125rem',
                borderRadius: '0.5rem',
                color: 'text.primary',
                borderColor: 'divider',
              }}
            >
              {reportsPageCopy.dateRangeLabel}
            </Button>
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

        <StatGrid columns={3}>
          {MOCK_REPORTS_OVERVIEW_KPIS.map((kpi, index) => {
            const Icon = KPI_ICONS[kpi.id as keyof typeof KPI_ICONS] ?? ShoppingBag;
            return (
              <OverviewStatCard
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
                    <Typography component="div" sx={{ fontSize: '0.8125rem' }}>
                      <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>
                        6 closed shifts
                      </Box>
                      <Box component="span" sx={{ color: 'text.secondary' }}>
                        {' · 2 still open'}
                      </Box>
                    </Typography>
                  ) : undefined
                }
              />
            );
          })}
        </StatGrid>

        <Box sx={{ mt: 2 }}>
          <StatGrid columns={3}>
            {MOCK_REPORTS_ORDER_CHANNELS.map((channel) => {
              const Icon = CHANNEL_ICON[channel.id];
              const accent = CHANNEL_STAT_ACCENT[channel.id] ?? 'info';
              return (
                <OverviewStatCard
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

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 280px' },
            gap: 2,
            alignItems: 'stretch',
          }}
        >
          <DualSeriesLineChart
            title={trendChart.title}
            xLabels={MOCK_REPORTS_WEEK_LABELS}
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
              {MOCK_REPORTS_TOP_SALES.title}
            </Typography>
            <Typography
              sx={{ mt: 1.25, fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}
            >
              {MOCK_REPORTS_TOP_SALES.headline}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: '0.8125rem', color: 'text.secondary' }}>
              {MOCK_REPORTS_TOP_SALES.dayLabel}
            </Typography>
            <Typography
              sx={{ mt: 1.5, fontSize: '1.25rem', fontWeight: 700, color: 'text.primary' }}
            >
              {MOCK_REPORTS_TOP_SALES.amount}
            </Typography>
          </Box>
        </Box>
      </OverviewSectionCard>

      <OverviewSectionCard>
        <ReportSectionHeader
          title={reportsPageCopy.orderTypePerformanceTitle}
          subtitle={reportsPageCopy.orderTypePerformanceSubtitle}
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
          {MOCK_REPORTS_ORDER_TYPE_ROWS.map((row) => {
            const Icon = CHANNEL_ICON[row.id as keyof typeof CHANNEL_ICON] ?? UtensilsCrossed;
            const accent = CHANNEL_STAT_ACCENT[row.id] ?? 'info';
            return (
              <OrderTypeMetricCard
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
        <ReportSectionHeader
          title={reportsPageCopy.recentOrdersTitle}
          badge="Complete"
          badgeColor="success"
          subtitle={reportsPageCopy.recentOrdersSubtitle}
          actionLabel={reportsPageCopy.recentOrdersAction}
        />
        <RecentOrdersTable
          rows={MOCK_REPORTS_RECENT_ORDERS}
          footerText={reportsPageCopy.recentOrdersFooter}
        />
      </OverviewSectionCard>

      <OverviewSectionCard>
        <ReportSectionHeader
          title={reportsPageCopy.sessionPerformanceTitle}
          subtitle={reportsPageCopy.sessionPerformanceSubtitle}
          actionLabel={reportsPageCopy.sessionPerformanceAction}
        />
        <SessionPerformanceTable rows={MOCK_REPORTS_SESSION_PERFORMANCE} />
      </OverviewSectionCard>

      <OverviewSectionCard>
        <ReportSectionHeader
          title={reportsPageCopy.financeSummaryTitle}
          badge={reportsPageCopy.financeSummaryBadge}
          badgeColor="warning"
          subtitle={reportsPageCopy.financeSummarySubtitle}
          actionLabel={reportsPageCopy.financeSummaryAction}
        />
        <StatGrid columns={4}>
          {MOCK_REPORTS_FINANCE_STATS.map((stat) => (
            <OverviewStatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              icon={FINANCE_ICONS[stat.id] ?? Banknote}
              accent={stat.accent as OverviewStatAccent}
              helperText={stat.helperText}
              sx={{ minHeight: 132 }}
            />
          ))}
        </StatGrid>
      </OverviewSectionCard>

      <OverviewSectionCard>
        <ReportSectionHeader
          title={reportsPageCopy.staffOperationsTitle}
          badge={reportsPageCopy.staffOperationsBadge}
          badgeColor="warning"
          subtitle={reportsPageCopy.staffOperationsSubtitle}
          actionLabel={reportsPageCopy.staffOperationsAction}
        />
        <StatGrid columns={3}>
          {MOCK_REPORTS_OPERATIONS_STATS.map((stat) => (
            <OverviewStatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              icon={OPERATIONS_ICONS[stat.id] ?? Users}
              accent={stat.accent as OverviewStatAccent}
              helperText={stat.helperText}
              sx={{ minHeight: 132 }}
            />
          ))}
        </StatGrid>
      </OverviewSectionCard>
    </Box>
  );
}
