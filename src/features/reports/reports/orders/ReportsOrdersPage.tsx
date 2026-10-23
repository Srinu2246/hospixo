'use client';

/**
 * Reports orders tab — summary KPIs, order trend, and daily breakdown.
 * Data from GET /v1/branches/{branch_id}/reports/orders/summary.
 */

import { useMemo, useState, type ReactNode } from 'react';
import {
  Box,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  ClipboardList,
  Download,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';
import { KpiCard, type KpiCardAccent } from '@/components/shared/ui/KpiCard';
import { SectionHeader } from '@/components/shared/ui/SectionHeader';
import { TrendChart } from '@/components/shared/ui/TrendChart';
import { ReportsOverviewDateRange } from '@/features/reports/reports/ReportsOverviewDateRange';
import {
  createDefaultReportsDateRange,
  deriveComparisonRange,
  formatIsoDate,
} from '@/lib/helpers/reportsOverview';
import {
  toReportsOrdersSummaryViewModel,
  type ReportsOrdersSummaryViewModel,
} from '@/lib/schemas/reports/reports/branchReports';
import { useReportsOrdersSummary } from '@/lib/hooks/reports/reports/useBranchReports';
import { reportsOrdersCopy } from '@/lib/mocks/reports/reports.mocks';

const SUMMARY_ICONS: Record<string, LucideIcon> = {
  'total-orders': ClipboardList,
  'dine-in-orders': UtensilsCrossed,
  'takeaway-orders': ShoppingBag,
  'delivery-orders': Truck,
};

const tableHeaderCellSx = {
  py: 1.5,
  px: 2,
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'text.secondary',
  borderColor: 'divider',
} as const;

const tableBodyCellSx = {
  py: 1.75,
  px: 2,
  fontSize: '0.8125rem',
  borderColor: 'divider',
} as const;

function OrdersSectionCard({ children }: Readonly<{ children: ReactNode }>) {
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

function DailyOrderTrendTable({
  rows,
}: Readonly<{
  rows: ReportsOrdersSummaryViewModel['dailyTrendRows'];
}>) {
  return (
    <TableContainer sx={{ overflowX: 'auto', borderRadius: '0.5rem' }}>
      <Table size="small" sx={{ minWidth: 640 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={tableHeaderCellSx}>Date</TableCell>
            <TableCell align="right" sx={tableHeaderCellSx}>
              Orders
            </TableCell>
            <TableCell align="right" sx={tableHeaderCellSx}>
              Gross sales
            </TableCell>
            <TableCell align="right" sx={tableHeaderCellSx}>
              Grand total
            </TableCell>
            <TableCell align="right" sx={tableHeaderCellSx}>
              Collected
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} sx={{ ...tableBodyCellSx, color: 'text.secondary' }}>
                No daily order trend rows for this period.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={tableBodyCellSx}>{row.date}</TableCell>
                <TableCell align="right" sx={tableBodyCellSx}>
                  {row.orderCount}
                </TableCell>
                <TableCell align="right" sx={tableBodyCellSx}>
                  {row.grossSales}
                </TableCell>
                <TableCell align="right" sx={tableBodyCellSx}>
                  {row.grandTotal}
                </TableCell>
                <TableCell align="right" sx={{ ...tableBodyCellSx, fontWeight: 600 }}>
                  {row.amountCollected}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function OrdersReportBody({ viewModel }: Readonly<{ viewModel: ReportsOrdersSummaryViewModel }>) {
  return (
    <>
      <OrdersSectionCard>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          {viewModel.summaryStats.map((stat) => (
            <KpiCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              icon={SUMMARY_ICONS[stat.id] ?? ClipboardList}
              accent={stat.accent as KpiCardAccent}
              footerText={stat.footerText}
              helperText={stat.helperText}
            />
          ))}
        </Box>
        <Typography sx={{ mt: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
          {viewModel.attributionNote}
        </Typography>
      </OrdersSectionCard>

      <OrdersSectionCard>
        <SectionHeader
          title={reportsOrdersCopy.trendTitle}
          subtitle={reportsOrdersCopy.trendSubtitle}
        />
        <Typography sx={{ mb: 1.5, fontSize: '0.75rem', color: 'text.secondary' }}>
          {viewModel.periodLabel}
        </Typography>
        <TrendChart
          title={viewModel.trendChart.title}
          xLabels={viewModel.trendChart.xLabels}
          primarySeries={viewModel.trendChart.primarySeries}
          comparisonSeries={viewModel.trendChart.comparisonSeries}
          primaryLegendLabel={viewModel.trendChart.primaryLegendLabel}
          comparisonLegendLabel={viewModel.trendChart.comparisonLegendLabel}
          highlightedLabel={viewModel.trendChart.highlightedLabel}
          yAxisStep={viewModel.trendChart.yAxisStep}
          ariaLabel="Daily order count trend"
        />
      </OrdersSectionCard>

      <OrdersSectionCard>
        <SectionHeader
          title={reportsOrdersCopy.dailyTableTitle}
          subtitle={reportsOrdersCopy.dailyTableSubtitle}
        />
        <DailyOrderTrendTable rows={viewModel.dailyTrendRows} />
      </OrdersSectionCard>
    </>
  );
}

export function ReportsOrdersPage() {
  const defaultRange = useMemo(() => createDefaultReportsDateRange(), []);
  const [dateFrom, setDateFrom] = useState(defaultRange.dateFrom);
  const [dateTo, setDateTo] = useState(defaultRange.dateTo);

  const comparisonRange = useMemo(
    () => deriveComparisonRange(dateFrom, dateTo),
    [dateFrom, dateTo],
  );

  const { data, isLoading, isError, error } = useReportsOrdersSummary({
    dateFrom,
    dateTo,
    compareFrom: formatIsoDate(comparisonRange.compareFrom),
    compareTo: formatIsoDate(comparisonRange.compareTo),
  });

  const viewModel = useMemo(
    () => (data ? toReportsOrdersSummaryViewModel(data) : undefined),
    [data],
  );

  let reportBody: ReactNode;
  if (isLoading) {
    reportBody = <Loading message="Loading orders report…" />;
  } else if (isError || !viewModel) {
    reportBody = (
      <AlertMessage
        variant="error"
        title="Unable to load orders report"
        message={
          error instanceof Error ? error.message : 'Try adjusting the date range and refresh.'
        }
      />
    );
  } else {
    reportBody = <OrdersReportBody viewModel={viewModel} />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
            {reportsOrdersCopy.title}
          </Typography>
          <Typography
            sx={{ mt: 0.5, fontSize: '0.8125rem', color: 'text.secondary', maxWidth: 560 }}
          >
            {reportsOrdersCopy.subtitle}
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
            }}
          >
            {reportsOrdersCopy.exportLabel}
          </Button>
        </Box>
      </Box>

      {reportBody}
    </Box>
  );
}
